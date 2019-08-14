// If mongodb.net username & password are not given as process arguments,
// they are loaded from environment variables; DB_USER, DB_PASS

// Aside from manually setting environment variables, `dotenv` can be used
// to load them from a `.env` file, which must be gitignored.
// See details: https://github.com/motdotla/dotenv

class EnvInterface {
  constructor() {
    this.loadCredentials();

    if(!this.user || !this.pass) {
      throw Error('Missing login credentials. Add <dbUser> <dbPass> as arguments.');
    }
  }

  loadCredentials() {
    if(!process.env.DB_USER || !process.env.DB_PASS) {
      const dotenv = require('dotenv');
      dotenv.config();
    }
    if(process.argv.length <= 2) {
      console.log('Attempting login with environment credentials');
      this.user = process.env.DB_USER;
      this.pass = process.env.DB_PASS;
      console.log(this.user);
    } else {
      this.user = process.argv[2];
      this.pass = process.argv[3];
    }
  }
}

module.exports = EnvInterface;
