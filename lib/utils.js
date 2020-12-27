const request = require('request');
const url = require('url');

// linked stylesheets could have absolute or relative paths
const normalizeUrl = (cssUrlParam, userUrl) => {
  let cssUrl = cssUrlParam;
  const urlObj = url.parse(userUrl);
  const isAbsolutePath = /^https?:\/\//i;
  const relativeToDomain = `${urlObj.protocol}//${urlObj.host}`;
  const relativeToPage = relativeToDomain + urlObj.path;

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

// request a url and return the response
const getUrl = (urlToFetch, callback) => {
  request.get(urlToFetch, (error, response) => {
    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }
  });
};

module.exports = { normalizeUrl, getUrl };
