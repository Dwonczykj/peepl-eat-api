/**
 * api/responses/viewOrJson.js
 *
 * This will be available in controllers as res.viewOrJson('foo');
 */

module.exports = function(viewFilePath, body = {}) {

  var req = this.req;
  var res = this.res;

  var statusCode = 200;

  body.status = statusCode;

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(body, body.status);
  }

  // Set status code and view locals
  res.status(body.status);
  for (var key in body) {
    res.locals[key] = body[key];
  }

  // And render view
  res.render(viewFilePath, body, (err) => {
    // If the view doesn't exist, or an error occured, send json
    if (err) {
      return res.json(body, body.status);
    }

    res.render(viewFilePath);
  });
};
