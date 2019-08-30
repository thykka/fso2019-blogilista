const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');

const config = require('./utils/config');

const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

module.exports = app;
