const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (_, res) => {
  const users = await User.find({}).populate('blogs');
  res.json(users.map(user => user.toJSON()));
});

usersRouter.post('/', async (req, res, next) => {
  let errors = [];
  const { password, username, name } = req.body;
  if(!password || !username || !name) {
    errors.push('Must have \'password\', \'username\' and \'name\'');
  }
  if(username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if(password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if(errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username: username,
      name: name,
      passwordHash
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);

  } catch(e) {
    next(e);
  }
});

module.exports = usersRouter;
