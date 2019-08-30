const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

module.exports = app;
