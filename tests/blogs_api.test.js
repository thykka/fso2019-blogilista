const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

const initialBlogs = [
  {
    'title': 'Test blog',
    'author': 'thykka',
    'url': 'http://example.com',
    'likes': 0
  },
  {
    'title': 'React patterns',
    'author': 'Michael Chan',
    'url': 'https://reactpatterns.com/',
    'likes': 7
  }
];

beforeEach(async () => {
  await Blog.deleteMany({});


  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

describe('GET /api/blogs', () => {
  test('blogs are returned as JSON', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are 2 blogs', async () => {
    const res = await api.get('/api/blogs');
    expect(res.body.length).toBe(2);
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
  test('response is in JSON', async () => {
    const result = await api.post('/api/blogs')
      .send({
        title: 'Hype wars',
        author: 'Gobert M. Cartin\'',
        url: 'http://example.com',
        likes: 9
      })
      .set('Accept', 'application/json');

    expect(result.status).toBe(201);
    expect(result.headers).toHaveProperty('content-type');
    expect(result.headers['content-type']).toMatch(/^application\/json/);
  });

  test('new blog increases the amount of blogs in the list', async () => {
    await api.post('/api/blogs')
      .send({
        title: 'Just another blog',
        author: 'Just another blogger',
        url: 'http://justanotherurl.com',
        likes: 0
      })
      .set('Accept', 'application/json');

    const result = await api.get('/api/blogs');
    expect(result.body.length).toBe(initialBlogs.length + 1);
  });

  test('the response matches the new blog object', async () => {
    const sentBlog = {
      title: 'A match made in heaven',
      author: 'Rex Egg',
      url: 'https://regexr.com',
      likes: 9001
    };
    const result = await api.post('/api/blogs')
      .send(sentBlog)
      .set('Accept', 'application/json');

    const receivedBlog = result.body;
    expect(receivedBlog.title).toBe(sentBlog.title);
    expect(receivedBlog.author).toBe(sentBlog.author);
    expect(receivedBlog.url).toBe(sentBlog.url);
    expect(receivedBlog.likes).toBe(sentBlog.likes);
  });

  test('if the new blog doesn\'t define likes, the initial likes should be 0', async() => {
    const result = await api.post('/api/blogs')
      .send({
        title: 'I was made for liking you, baby',
        author: 'NaN Jon Bovi',
        url: 'http://example.com'
      })
      .set('Accept', 'application/json');

    expect(result.body.likes).toBe(0);
  });

  test('if the new blog doesn\'t define a title and url, the response is 400', async () => {
    const result = await api.post('/api/blogs')
      .send({
        author: 'Under construction',
        likes: 5
      })
      .set('Accept', 'application/json');

    expect(result.status).toBe(400);
  });
});


afterAll(() => mongoose.connection.close());
