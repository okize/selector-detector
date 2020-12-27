// modules
const path = require('path');
const fs = require('fs');

const sd = require('./app');
const pkg = require('../package.json');

let prettyPrint = false;

// output version number of app
const displayVersion = () => console.log(pkg.version);

// output help documentation of app
const displayHelp = () => {
  const filepath = path.join(__dirname, '..', 'doc', 'help.txt');
  const doc = fs.readFileSync(filepath, 'utf8');

  return console.log(`\n${doc}\n`);
};

const cli = (argv) => {
  // url has been passed as argument
  if (argv._.length > 0) {
    // "pretty print" flag enabled
    if (argv.pretty || argv.p) {
      prettyPrint = true;
    }

    return sd(argv._[0], prettyPrint);
  }

  // --version
  if (argv.version || argv.V) {
    return displayVersion();
  }

  // --help
  if (argv.help || argv.h) {
    return displayHelp();
  }

  // if no command, display help
  return displayHelp();
};

module.exports = cli;
