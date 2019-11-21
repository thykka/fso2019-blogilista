const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  message: { type: String, required: true },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }
});

commentSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Blog = mongoose.model('Comment', commentSchema);

module.exports = Blog;
