var cssParse = require('css-parse');

// parses the css of the request response and returns
// an object of css rules, selectors & declarations
module.exports = function (request, callback) {

  // could not properly request CSS
  if ((request.body).match(/Not found/)) {
    throw Error('Could not find ' + request.request.href);
  }

  var type, href, name, parsedStylesheet, rules, mqRules, count = {};

  type = request.cssType ? 'inline' : 'linked',
  href = request.request.href,
  name = href ? href.split('/').pop() : '',
  parsedStylesheet = cssParse(request.body),
  rules = parsedStylesheet.stylesheet.rules,
  count = {
    name: name,
    url: href,
    type: type,
    rules: rules.length,
    selectors: 0,
    declarations: 0
  };

  // check for rules of type media for more rules and selectors
  for (var i = 0, len = count.rules; i < len; i++) {

    if (rules[i].type === 'rule') {

      if (typeof rules[i].selectors !== 'undefined') {
        count.selectors = count.selectors + rules[i].selectors.length;
      }

      if (typeof rules[i].declarations !== 'undefined') {
        count.declarations = count.declarations + rules[i].declarations.length;
      }

    } else if (rules[i].type === 'media') {

      mqRules = rules[i].rules;

      mqRules.forEach( function(mqRule) {

        if (typeof mqRule.selectors !== 'undefined') {
          count.selectors = count.selectors + mqRule.selectors.length;
        }

        if (typeof mqRule.declarations !== 'undefined') {
          count.declarations = count.declarations + mqRule.declarations.length;
        }

      });

    } else if (rules[i].type === 'comment') {

      // TODO, write something better than this hack
      count.rules = count.rules - 1;

    }

  }

  callback(null, count);

};