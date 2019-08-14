const EnvInterface = require('../interfaces/env');
const env = new EnvInterface();

module.exports = {
  PORT: 3003,
  MONGODB_URI: `mongodb+srv://${
    env.user
  }:${
    env.pass
  }@thykka-fso2k19-cswvc.mongodb.net/blogs?retryWrites=true&w=majority`
};
