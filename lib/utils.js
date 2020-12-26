const request = require('request');
const url = require('url');

module.exports = {

  // linked stylesheets could have absolute or relative paths
  normalizeUrl(cssUrl, userUrl) {
    let urlObj; let isAbsolutePath; let relativeToDomain; let
      relativeToPage;

    urlObj = url.parse(userUrl);
    isAbsolutePath = /^https?:\/\//i;
    relativeToDomain = `${urlObj.protocol}//${urlObj.host}`;
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
  },

  // request a url and return the response
  getUrl(url, callback) {
    request.get(url, (error, response) => {
      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }
    });
  },

};
