const rp = require('request-promise');
const mergeOptions = require('merge-options');

module.exports = function (options) {
  const defaultOpts = {
    json: true, // Automatically parses the JSON string in the response
    resolveWithFullResponse: true
  };

  const opts = mergeOptions(defaultOpts, options);

  return rp(opts)
    .then(response =>
      // POST succeeded...
      response)
    .catch(err =>
      // POST failed...
      err);
};
