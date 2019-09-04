const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const api = supertest(app);

const initialBlogs = [
  {
    title: 'Test blog',
    author: 'thykka',
    url: 'http://example.com',
    likes: 0
  },
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  }
];

const initialUsers = [
  {
    username: 'tester',
    name: 'Tester #1',
    blogs: [],
  }
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'temporary entry',
    url: 'https://example.com'
  });
  await blog.save();
  await blog.remove();
  return blog._id.toString();
};

const existingUserId = async () => {
  const users = await User.find({ username: 'tester' });
  if(users.length > 0) return users[0]._id;
  return false;
};

const getLoginToken = async () => {
  const user = await User.find({});
  if(user.length > 0) {
    return jwt.sign({
      username: user[0].username,
      id: user[0]._id
    }, process.env.SECRET);
  }
  return null;
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

beforeEach(async () => {
  await User.deleteMany({});
  let userObject = new User(initialUsers[0]);
  await userObject.save();

  const userId = await existingUserId();

  await Blog.deleteMany({});

  const resultIds = [];
  let blogObject = new Blog(Object.assign(initialBlogs[0], { user: userId }));
  let result = await blogObject.save();
  resultIds.push(result._id);

  blogObject = new Blog(Object.assign(initialBlogs[1], { user: userId }));
  result = await blogObject.save();
  resultIds.push(result._id);

  userObject.blogs = resultIds;
  await userObject.save();
});

describe('GET /api/blogs', () => {
  test('blogs are returned as JSON', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const res = await api.get('/api/blogs');
    expect(res.body.length).toBe(initialBlogs.length);
  });

  test('the first blog links to example.com', async () => {
    const res = await api.get('/api/blogs');
    expect(res.body[0].url).toBe('http://example.com');
  });

  test('the returned blog object to have at least certain properties', async() => {
    const res = await api.get('/api/blogs');
    const blog = res.body[0];
    expect(blog).toHaveProperty('author');
    expect(blog).toHaveProperty('id');
    expect(blog).toHaveProperty('likes');
    expect(blog).toHaveProperty('title');
    expect(blog).toHaveProperty('url');
  });
});

describe('POST /api/blogs', () => {
  test('fails with 400 if no token provided', async () => {
    const result = await api.post('/api/blogs')
      .send({
        title: 'Will not get added to the list',
        author: 'Epic test guy',
        url: 'http://example.com',
        likes: -1
      })
      .set('Accept', 'application/json');

    expect(result.status).toBe(400);
  });

  test('response is in JSON', async () => {
    const token = await getLoginToken();
    const result = await api.post('/api/blogs')
      .send({
        title: 'Hype wars',
        author: 'Gobert M. Cartin\'',
        url: 'http://example.com',
        likes: 9
      })
      .set('authorization', 'bearer ' + token)
      .set('Accept', 'application/json');

    expect(result.status).toBe(201);
    expect(result.headers).toHaveProperty('content-type');
    expect(result.headers['content-type']).toMatch(/^application\/json/);
  });

  test('new blog increases the amount of blogs in the list', async () => {
    const token = await getLoginToken();
    await api.post('/api/blogs')
      .send({
        title: 'Just another blog',
        author: 'Just another blogger',
        url: 'http://justanotherurl.com',
        likes: 0
      })
      .set('authorization', 'bearer ' + token)
      .set('Accept', 'application/json');

    const result = await api.get('/api/blogs');
    expect(result.body.length).toBe(initialBlogs.length + 1);
  });

  test('the response matches the new blog object', async () => {
    const token = await getLoginToken();
    const sentBlog = {
      title: 'A match made in heaven',
      author: 'Rex Egg',
      url: 'https://regexr.com',
      likes: 9001
    };
    const result = await api.post('/api/blogs')
      .send(sentBlog)
      .set('authorization', 'bearer ' + token)
      .set('Accept', 'application/json');

    const receivedBlog = result.body;
    expect(receivedBlog.title).toBe(sentBlog.title);
    expect(receivedBlog.author).toBe(sentBlog.author);
    expect(receivedBlog.url).toBe(sentBlog.url);
    expect(receivedBlog.likes).toBe(sentBlog.likes);
  });

  test('if the new blog doesn\'t define likes, the initial likes should be 0', async() => {
    const token = await getLoginToken();
    const result = await api.post('/api/blogs')
      .send({
        title: 'I was made for liking you, baby',
        author: 'NaN Jon Bovi',
        url: 'http://example.com'
      })
      .set('authorization', 'bearer ' + token)
      .set('Accept', 'application/json');

    expect(result.body.likes).toBe(0);
  });

  test('if no title or url defined, the response status is 400', async () => {
    const token = await getLoginToken();
    const result = await api.post('/api/blogs')
      .send({
        author: 'Under construction',
        likes: 5
      })
      .set('authorization', 'bearer ' + token)
      .set('Accept', 'application/json');

    expect(result.status).toBe(400);
  });
});

describe('DELETE /api/blogs/:id', () => {
  test('fails with 400 if no token provided', async () => {
    const listResponse = await api.get('/api/blogs');
    const { id } = listResponse.body[0];
    const result = await api.delete('/api/blogs/' + id);

    expect(result.status).toBe(400);
  });

  test('response status is 204', async () => {
    const listResponse = await api.get('/api/blogs');
    const { id } = listResponse.body[0];
    const token = await getLoginToken();

    const result = await api.delete('/api/blogs/' + id)
      .set('authorization', 'bearer ' + token);

    expect(result.status).toBe(204);
  });

  test('deleting should decrease the blogs length by 1', async () => {
    const listResponse = await api.get('/api/blogs');
    const { id } = listResponse.body[0];
    const blogsLength = listResponse.body.length;

    const token = await getLoginToken();
    await api.delete('/api/blogs/' + id)
      .set('authorization', 'bearer ' + token);

    const result = await api.get('/api/blogs');

    expect(result.body.length).toBe(blogsLength - 1);
  });

  test('if invalid id is provided, response status is 400', async () => {
    const token = await getLoginToken();
    const result = await api.delete('/api/blogs/foobar')
      .set('authorization', 'bearer ' + token);
    expect(result.status).toBe(400);
  });

  test('if expired id is provided, response status is 404', async () => {
    const token = await getLoginToken();
    const id = await nonExistingId();
    const result = await api.delete('/api/blogs/' + id)
      .set('authorization', 'bearer ' + token);
    expect(result.status).toBe(404);
  });
});


describe('PUT /api/posts/:id', () => {
  test('response status is 204', async () => {
    const blogs = await blogsInDb();
    const id = blogs[0].id;
    const result = await api.put('/api/blogs/' + id);
    expect(result.status).toBe(200);
  });

  test('can change amount of likes', async () => {
    const blogs = await blogsInDb();
    const id = blogs[0].id;
    const result = await api.put('/api/blogs/' + id)
      .send({
        likes: 100
      });
    expect(result.body.likes).toBe(100);
  });

  test('if invalid id is provided, response status is 400', async () => {
    const result = await api.put('/api/blogs/foobar');
    expect(result.status).toBe(400);
  });

  test('if expired id is provided, response status is 404', async () => {
    const id = await nonExistingId();
    const result = await api.put('/api/blogs/' + id);
    expect(result.status).toBe(404);
  });
});

afterAll(() => mongoose.connection.close());
