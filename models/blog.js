const config = require('../utils/config');

const mongoose = require('mongoose');
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
