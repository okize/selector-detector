var request = require('request');
var url = require('url');

module.exports = {

  // linked stylesheets could have absolute or relative paths
  normalizeUrl: function (cssUrl, userUrl) {

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

  },

  // request a url and return the response
  getUrl: function (url, callback) {

    request.get(url, function (error, response) {

      if (error) {
        callback(error);
      } else {
        callback(null, response);
      }

    });

  }

};