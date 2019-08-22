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
  test('blogs are returned as json', async () => {
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


afterAll(() => mongoose.connection.close());
