const blogsRouter = require('express').Router();
const Blog = require('../models/blog');


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

module.exports = blogsRouter;
