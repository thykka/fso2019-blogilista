const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (_, response) => {
  const blogs = await Blog.find({}).populate(['user', 'comments']);
  response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params;
  try {
    const blog = await Blog.findById(id).populate(['user', 'comments']);
    if(blog) {
      response.json(blog.toJSON());
      return;
    } else {
      response.status(404).json({
        error: 'No blog found with id ' + id
      });
    }
  } catch(e) {
    next(e);
  }
});

blogsRouter.post('/like/:id', async (request, response, next) => {
  const { id } = request.params;
  try {
    const blog = await Blog.findById(id);
    if(!blog) {
      response.status(404).json({
        error: 'No blog found with id ' + id
      });
      return;
    }
    const currentLikes = blog.likes || 0;
    const updatedBlog = await Blog.findByIdAndUpdate(id, {
      likes: currentLikes + 1
    }, { 'new': true });
    response.json(updatedBlog.toJSON());

  } catch(e) {
    next(e);
  }
});

blogsRouter.post('/', async (request, response, next) => {
  const { title, url, author, likes } = request.body;
  const { token } = request;

  let user = false;

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if(!token || !decodedToken.id) {
      return response.status(401).json({ error: 'invalid/missing token' });
    }

    if(!title || !url) {
      return response.status(400).json({
        error: 'Must have \'title\' and \'url\''
      });
    }

    user = await User.findById(decodedToken.id);

    if(!user) return response.status(400).json({
      error: 'Invalid user'
    });

    const blog = new Blog({
      title, url, author, likes,
      user: user._id
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    // TODO: Maybe it's possible to populate without
    // fetching new data in an extra call?
    const populatedBlog = await Blog.findById(savedBlog._id).populate(['user', 'comments']);
    response.status(201).json(populatedBlog);

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

blogsRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params;
  console.log('about to delete ' + id);
  try {
    // verify token
    const { token } = request;

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if(!token || !decodedToken.id) {
      return response.status(401).json({ error: 'invalid/missing token' });
    }

    // get current user
    const user = await User.findById(decodedToken.id);
    if(!user) {
      console.log(`No user for decodedToken ${ decodedToken.id }`);
      return response.status(400).json({ error: 'Invalid user' });
    }

    const blogItem = await Blog.findById(id);

    if(!blogItem) {
      console.log(`no blog item found with id ${id}`);
      response.status(404).end();
    }

    // Remove the blog item itself
    const removedBlog = await Blog.findByIdAndRemove(request.params.id);

    // Remove blog reference from user
    if(removedBlog) {
      user.blogs = user.blogs.filter(blog => blog !== blogItem._id);
      await user.save();
    }
    response.status(removedBlog ? 204 : 404).end();
  } catch(e) {
    next(e);
  }
});

blogsRouter.get('/:id/comments', async (request, response, next) => {
  const { id } = request.params;
  try {
    const blog = await Blog.findById(id).populate(['user', 'comments']);
    if(!blog) {
      response.status(404).json({ error: 'No blog found with id ' + id });
      return;
    } else {
      response.json(blog.toJSON().comments);
    }
  } catch(e) {
    next(e);
  }
});

blogsRouter.post('/:id/comments', async (request, response, next) => {
  const blogId = request.params.id;
  const { message } = request.body;
  if(typeof message !== 'string' || message.length === 0) {
    response.status(400).json({
      error: 'Comment message missing or malformed'
    });
    return;
  }
  try {
    const blog = await Blog.findById(blogId);
    if(!blog) {
      response.status(404).json({
        error: 'No blog found with id ' + blogId
      });
      return;
    } else {
      const comment = new Comment({
        message,
        blog: blogId
      });

      const savedComment = await comment.save();
      console.log(`New Comment "${ message }" (${ savedComment._id })`);
      blog.comments = blog.comments.concat(savedComment._id);
      await blog.save();

      const populatedBlog = await Blog.findById(blogId).populate(['user', 'comments']);
      response.status(201).json(populatedBlog);
    }
  } catch(e) {
    next(e);
  }
});

module.exports = blogsRouter;
