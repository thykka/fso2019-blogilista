const config = require('../utils/config');
const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
});

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String
});

userSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
