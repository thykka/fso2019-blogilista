const config = require('../utils/config');

const mongoose = require('mongoose');
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: { type: Number, default: 0 }
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
