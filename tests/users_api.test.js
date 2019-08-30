const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

const initialUsers = [
  {
    name: 'Test User (no password)',
    username: 'testuser'
  },{
    name: 'Aulis Gerlander',
    username: 'auge',
    password: 'virallinen valvoja #1'
  }
];

const usersInDb = async () => {
  const users = await User.find({});
  // Adding users like this bypasses checks, not recommended outside of test fixtures
  return users.map(user => user.toJSON());
};

describe('GET /api/users, when there is 1 user in db', () => {

  beforeEach(async () => {
    await User.deleteMany({});

    const userObject = new User(initialUsers[0]);
    await userObject.save();
  });

  test('users are returned as JSON', async () => {
    await api.get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('a list of one user is returned', async () => {
    const res = await api.get('/api/users');
    expect(res.body.length).toBe(1);
  });
});

describe('POST /api/users, when there is 1 user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const userObject = new User(initialUsers[0]);
    await userObject.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb();
    const newUser = {
      name: 'Anne Newmoss',
      username: 'anew',
      password: '________'
    };
    await api.post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });


  test('creation fails with too short password', async () => {
    const newUser = {
      name: 'Short Password',
      username: 'shortpass',
      password: '1'
    };
    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('creation fails with too short username', async () => {
    const newUser = {
      name: 'Short Username',
      username: 'un',
      password: '12345678'
    };
    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('creation fails if provided username is not unique', async() => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: initialUsers[0].username,
      name: 'Imp Oster',
      password: '12345678'
    };
    const result = await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('unique');
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });
});

afterAll(() => mongoose.connection.close());
