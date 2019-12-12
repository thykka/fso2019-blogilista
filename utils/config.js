require('dotenv').config();

const PORT = process.env.PORT;
const TESTING = process.env.NODE_ENV === 'test';
const MONGODB_URI = TESTING
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI;

module.exports = {
  PORT,
  TESTING,
  MONGODB_URI
};
