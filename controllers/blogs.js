const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (_, response) => {
  const blogs = await Blog.find({}).populate('user');
  response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.post('/', async (request, response, next) => {
  const { title, url, author, userId, likes } = request.body;
  if(!title || !url) {
    return response.status(400).json({
      error: 'Must have \'title\' and \'url\''
    });
  }
  const user = await User.findById(userId);
  if(!user) return response.status(400).json({
    error: 'Invalid user'
  });
  const blog = new Blog({
    title, url, author, likes,
    user: user._id
  });

  try {
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  } catch(e) {
    next(e);
  }
});

blogsRouter.put('/:id', async (request, response) => {
  const { author, likes, title, url } = request.body;
  const blogData = { author, likes, title, url };
  try {
    const result = await Blog.findByIdAndUpdate(
      request.params.id, blogData, {
        new: true,
        context: 'query',
        omitUndefined: true
      }
    );
    if(!result) response.status(404).end();
    response.json(result.toJSON());
  } catch(e) {
    response.status(400).end();
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const result = await Blog.findByIdAndRemove(request.params.id);
    response.status(result ? 204 : 404).end();
  } catch(e) {
    response.status(400).end();
  }
});

module.exports = blogsRouter;
