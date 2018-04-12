const chalk = require('chalk');

const Logger = {
  info: function(...msg) {
    console.log(chalk.green('[INFO]'), chalk.green(...msg));
  },

  warn: function(...msg) {
    console.log(chalk.yellow('[WARN]'), chalk.yellow(...msg));
  },

  error: function(...msg) {
    console.log(chalk.red('[ERROR]'), chalk.red(...msg));
  }
};

module.exports = Logger;
