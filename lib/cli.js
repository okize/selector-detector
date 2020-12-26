// modules
const path = require('path');
const fs = require('fs');

const sd = require(path.join(__dirname, '..', 'lib', 'app'));

let prettyPrint = false;

// output version number of app
const displayVersion = function () {
  const pkg = require(path.join(__dirname, '..', 'package.json'));

  return console.log(pkg.version);
};

// output help documentation of app
const displayHelp = function () {
  let filepath; let
    doc;

  filepath = path.join(__dirname, '..', 'doc', 'help.txt');

  doc = fs.readFileSync(filepath, 'utf8');

  return console.log(`\n${doc}\n`);
};

module.exports = function (argv) {
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

  // no command displays help
  if (!argv._.length) {
    return displayHelp();
  }
};
