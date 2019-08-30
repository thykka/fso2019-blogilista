const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

const initialUsers = [
  {
    name: 'Dorn Jönner',
    username: 'dojo',
    password: 'IDDQD'
  },{
    name: 'Aulis Gerlander',
    username: 'auge',
    password: 'virallinen valvoja #1'
  }
];

beforeEach(async () => {
  await User.deleteMany({});

  let userObject = new User(initialUsers[0]);
  await userObject.save();

  userObject = new User(initialUsers[1]);
  await userObject.save();
});

describe('GET /api/users', () => {
  test('users are returned as JSON', async () => {
    await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all users are returned', async () => {
    const res = await api.get('/api/users');
    expect(res.body.length).toBe(initialUsers.length);
  });
});

describe('POST /api/users', () => {
  test('response is in JSON', async () => {
    const result = await api.post('/api/users')
      .send({
        name: 'Anne Newmoss',
        username: 'anew',
        password: 'testAccount'
      })
      .set('Accept', 'application/json');

    expect(result.status).toBe(201);
    expect(result.headers).toHaveProperty('content-type');
    expect(result.headers['content-type']).toMatch(/^application\/json/);
  });
});

afterAll(() => mongoose.connection.close());
