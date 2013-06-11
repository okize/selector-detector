// modules
var async = require('async'),
    request = require('request'),
    cheerio = require('cheerio'),
    cssParse = require('css-parse'),
    url = require('url');

// linked stylesheets could have absolute or relative paths
var normalizeUrl = function (cssUrl, userUrl) {

  var urlObj, isAbsolutePath, relativeToDomain, relativeToPage;

  urlObj = url.parse(userUrl);
  isAbsolutePath = /^https?:\/\//i;
  relativeToDomain = urlObj.protocol + '//' + urlObj.host;
  relativeToPage = relativeToDomain + urlObj.path;

  // check if the url is relative or absolute
  if (!isAbsolutePath.test(cssUrl)) {

    if (cssUrl.charAt(0) !== '/') {

      // css url is relative to the page
      cssUrl = url.resolve(relativeToPage, cssUrl);

    } else {

      // css url is relative to the domain
      cssUrl = url.resolve(relativeToDomain, cssUrl);

    }

  }

  return cssUrl;

};

// parses the css of the request response and returns
// an object of css rules, selectors & declarations
var parseCss = function (request, callback) {

  var type, href, name, parsedStylesheet, rules, count = {};

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

  for (var i = 0; i < count.rules; i++) {

    if (typeof rules[i].selectors !== 'undefined') {
      count.selectors = count.selectors + rules[i].selectors.length;
    }

    if (typeof rules[i].declarations !== 'undefined') {
      count.declarations = count.declarations + rules[i].declarations.length;
    }

  }

  callback(null, count);

};

// request a url and return the response
var getUrl = function (url, callback) {

  request.get(url, function (error, response) {

    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }

  });

};

module.exports = function (userUrl) {

  // request url and look for linked stylesheets and inline styles
  request({ uri: userUrl }, function (error, response, body) {

    var $, inlinestyles, inlinestylesTotal, stylesheets, stylesheetTotal, fakeRequest,
        stylesheetList = [], requests = [];

    if (error) {
      return console.error(error);
    }

    if (response.statusCode !== 200) {
      return console.error('Error connecting to ' + userUrl + '. Status code: ' + response.statusCode);
    }

    // load response body into variable and use jquery to parse it for styles
    $ = cheerio.load(body),
    stylesheets = $('link[rel="stylesheet"]'),
    stylesheetTotal = stylesheets.length,
    inlinestyles = $('style'),
    inlinestylesTotal = inlinestyles.length;

    // check inline styles, then check linked stylesheets, then parse, then output
    async.waterfall([

      // if there are inline styles, 'fake' a request object
      // there's a better way to do this...
      function (callback) {

        if (inlinestylesTotal > 0) {

          for (var i = 0; i < inlinestylesTotal; i++) {

            fakeRequest = { request: {} }; // super kludge
            fakeRequest.cssType = 'inline';
            fakeRequest.request.href = 'inline-style-block-' + i;
            fakeRequest.body = inlinestyles[i].children[0] ? inlinestyles[i].children[0].data : '';
            requests.push(fakeRequest);

          }

          callback(null, requests);

        } else {
          callback(null, requests);
        }

      },

      // if there are linked stylesheets populate an array with their urls
      function (requests, callback) {

        if (stylesheetTotal > 0) {

          for (var i = 0; i < stylesheetTotal; i++) {
            stylesheetList.push( normalizeUrl( stylesheets[i].attribs.href, userUrl ) );
          }

          // get linked stylesheets
          async.map(stylesheetList, getUrl, function (error, results) {

            if (error) {

              console.error('error requesting stylesheets');

            } else {

              for (var j = 0, len = results.length; j < len; j++) {
                requests.push(results[j]);
              }

              callback(null, requests);

            }

          });

        } else {
          callback(null, requests);
        }

      },

      // pipe each style request into parseCss and pass along results
      function (requests, callback) {

        async.map(requests, parseCss, function (error, results) {
          if (error) {
            console.error('error parsing styles');
          } else {
            callback(null, results);
          }
        });

      },

      // add a properties to track the original url and convert to json
      function (results, callback) {

        var result = {
          page: userUrl,
          result: results
        };

        // return json
        callback(null, JSON.stringify(result, null, 2));

      }

    ],

    // all done
    function (error, result) {

      if (error) {
        return console.error(error);
      }

      console.log(result);

    });

  });

};