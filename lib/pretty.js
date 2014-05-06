var Table = require('cli-table');

// output a nicely formatted table to CLI
module.exports = function (json) {

  var results = json.result;
  var table = new Table({
    head: ['Stylesheet Filename', 'Rules', 'Selectors', 'Declarations'],
    style: {
      head: ['blue']
    }
  });

  var checkCount = function (num) {

    var red  = '\033[31m',
        reset = '\033[0m';

    if (num > 4095) {
      return red + num + reset;
    } else {
      return num;
    }

  };

  var pushRowsToTable = function (el, i, arr) {

    var name, rules, selectors, declarations;

    name = results[i].name.replace(/.css/, ''),
    rules = results[i].rules,
    selectors = checkCount(results[i].selectors),
    declarations = results[i].declarations;

    table.push([name, rules, selectors, declarations]);

  };

  results.forEach(pushRowsToTable);

  console.log(table.toString());

};