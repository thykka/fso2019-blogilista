const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const result = await Blog.findByIdAndRemove(request.params.id);
    response.status(result ? 204 : 404).end();
  } catch(e) {
    response.status(400).end();
  }
});

blogsRouter.get('/', async (_, response) => {
  const blogs = await Blog.find({});
  response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.post('/', async (request, response) => {
  const { title, url } = request.body;
  if(!title || !url) {
    return response.status(400).json({
      error: 'Must have \'title\' and \'url\''
    });
  }
  const blog = new Blog(request.body);
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
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

module.exports = blogsRouter;
