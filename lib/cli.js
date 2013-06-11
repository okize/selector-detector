// modules
var sd = require(process.cwd() + '/lib/app'),
  path = require('path'),
  fs = require('fs');

// output version number of app
var displayVersion = function () {

  var pkg = require(process.cwd() + '/package.json');

  return console.log(pkg.version);

};

// output help dpcumentation of app
var displayHelp = function () {

  var filepath, doc;

  // help doc file path
  filepath = path.join(__dirname, '..', 'doc', 'help.txt');

  // get help doc text file
  doc = fs.readFileSync(filepath, 'utf8');

  // output doc
  return console.log('\n' + doc + '\n');

};

module.exports = function (argv) {

  // url has been passed
  if (argv._.length > 0) {
    return sd(argv._[0]);
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