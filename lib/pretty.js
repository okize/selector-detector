const Table = require('cli-table');

// output a nicely formatted table to CLI
const pretty = (json) => {
  const results = json.result;
  const table = new Table({
    head: ['Stylesheet Filename', 'Rules', 'Selectors', 'Declarations'],
    style: {
      head: ['blue'],
    },
  });

  const checkCount = (num) => {
    const ctrl = '\x1B'; // XTerm Control Sequence
    const red = `${ctrl}[31m`;
    const reset = `${ctrl}[0m`;

    if (num > 4095) {
      return red + num + reset;
    }
    return num;
  };

  const pushRowsToTable = (el, i) => {
    const name = results[i].name.replace(/.css/, '');
    const { rules } = results[i];
    const selectors = checkCount(results[i].selectors);
    const { declarations } = results[i];

    table.push([name, rules, selectors, declarations]);
  };

  results.forEach(pushRowsToTable);

  console.log('\\033[90m%s \\033[36m%s\\033[m');

  console.log(table.toString());
};

module.exports = pretty;
