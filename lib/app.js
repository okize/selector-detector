// modules
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var Progger = require('progger');
var path = require('path');
var utils = require(path.resolve(__dirname, './', 'utils'));
var parseCss = require(path.resolve(__dirname, './', 'parser'));
var prettyPrint = require(path.resolve(__dirname, './', 'pretty'));

var userAgentMap = {
  'ie': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)'
};

module.exports = function (userUrl, pretty) {

  var requestOpts, progress;

  requestOpts = {
    uri: userUrl,
    headers: {
      'User-Agent': userAgentMap['ie']
    }
  };

  // progress ticker
  progress = new Progger();

  process.stdout.write('\nRetrieving CSS data from ' + userUrl);

  // start progress ticker
  progress.start();

  // request url and look for linked stylesheets and inline styles
  request(requestOpts, function (error, response, body) {

    var $, inlinestyles, inlinestylesTotal, stylesheets, stylesheetTotal,
        fakeRequest, stylesheetList = [], requests = [];

    if (error) {

      // stop progress ticker
      progress.stop();

      return console.error(error);

    }

    if (response.statusCode !== 200) {

      // stop progress ticker
      progress.stop();

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
            fakeRequest.request.href = 'inline-style-block-' + (i + 1);
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
            stylesheetList.push( utils.normalizeUrl( stylesheets[i].attribs.href, userUrl ) );
          }

          // get linked stylesheets
          async.map(stylesheetList, utils.getUrl, function (error, results) {

            if (error) {

              // stop progress ticker
              progress.stop();

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

            // stop progress ticker
            progress.stop();

            console.error('error parsing styles');
          } else {
            callback(null, results);
          }
        });

      },

      // add a properties to track the original url
      function (results, callback) {

        var result = {
          page: userUrl,
          result: results
        };

        // return json
        callback(null, result);

      }

    ],

    // all done
    function (error, result) {

      // stop progress ticker
      progress.stop();

      if (error) {
        return console.error(error);
      }

      if (pretty) {

        // pretty print results
        prettyPrint(result);

      } else {

        // convert to json
        console.log(JSON.stringify(result, null, 2));

      }

    });

  });

};