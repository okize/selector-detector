const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const Progger = require('progger');

const utils = require('./utils');
const parseCss = require('./parser');
const prettyPrint = require('./pretty');

const userAgentMap = {
  ie: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
};

const app = (userUrl, pretty) => {
  const requestOpts = {
    uri: userUrl,
    headers: {
      'User-Agent': userAgentMap.ie,
    },
  };

  // progress ticker
  const progress = new Progger();

  process.stdout.write(`\nRetrieving CSS data from ${userUrl}`);

  // start progress ticker
  progress.start();

  // request url and look for linked stylesheets and inline styles
  request(requestOpts, (err, response, body) => {
    if (err) {
      progress.stop();
      return console.error(err);
    }

    if (response.statusCode !== 200) {
      progress.stop();
      return console.error(`Error connecting to ${userUrl}. Status code: ${response.statusCode}`);
    }

    // load response body into variable and use jquery to parse it for styles
    const $ = cheerio.load(body);
    const stylesheets = $('link[rel="stylesheet"]');
    const stylesheetTotal = stylesheets.length;
    const inlinestyles = $('style');
    const inlinestylesTotal = inlinestyles.length;
    const stylesheetList = [];
    const requests = [];
    let fakeRequest;

    // check inline styles, then check linked stylesheets, then parse, then output
    return async.waterfall([

      // if there are inline styles, 'fake' a request object
      // there's a better way to do this...
      (callback) => {
        if (inlinestylesTotal > 0) {
          for (let i = 0; i < inlinestylesTotal; i++) {
            fakeRequest = { request: {} }; // super kludge
            fakeRequest.cssType = 'inline';
            fakeRequest.request.href = `inline-style-block-${i + 1}`;
            fakeRequest.body = inlinestyles[i].children[0] ? inlinestyles[i].children[0].data : '';
            requests.push(fakeRequest);
          }

          callback(null, requests);
        } else {
          callback(null, requests);
        }
      },

      // if there are linked stylesheets populate an array with their urls
      (requests1, callback) => {
        if (stylesheetTotal > 0) {
          for (let i = 0; i < stylesheetTotal; i++) {
            stylesheetList.push(utils.normalizeUrl(stylesheets[i].attribs.href, userUrl));
          }

          // get linked stylesheets
          async.map(stylesheetList, utils.getUrl, (error, results) => {
            if (error) {
              // stop progress ticker
              progress.stop();

              console.error('error requesting stylesheets');
            } else {
              for (let j = 0, len = results.length; j < len; j++) {
                requests1.push(results[j]);
              }

              callback(null, requests1);
            }
          });
        } else {
          callback(null, requests1);
        }
      },

      // pipe each style request into parseCss and pass along results
      (requests2, callback) => {
        async.map(requests2, parseCss, (error, results) => {
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
      (results3, callback) => {
        const result = {
          page: userUrl,
          result: results3,
        };

        // return json
        callback(null, result);
      },

    ],

    // all done
    (error, result) => {
      progress.stop();

      if (error) {
        return console.error(error);
      }

      if (pretty) {
        // pretty print results
        return prettyPrint(result);
      }
      // convert to json
      return console.log(JSON.stringify(result, null, 2));
    });
  });
};

module.exports = app;
