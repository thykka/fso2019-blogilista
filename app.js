const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const config = require('./utils/config');
const tokenExtractor = require('./middlewares/tokenExtractor');

const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(tokenExtractor);
app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

const errorHandler = (error, _, res, next) => {
  if(error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if(error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'Malformed ID' });
  } else if(error.name === 'JsonWebTokenError') {
    return res.status(400).send({ error: 'Token missing/invalid' });
  }
  next(error);
};


app.use(errorHandler);

module.exports = app;
