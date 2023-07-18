/**
 * is-logged-in
 *
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  if (!req.session.userId) {
    sails.log('Policy:<is-logged-in> -> redirect to login as no active session');
    // Respond with view or JSON.
    if (req.wantsJSON) {
      return res.forbidden();
    } else {
      // ~ https://sailsjs.com/documentation/reference/request-req/req-original-url
      return res.redirect('/admin/login-with-password?next=' + encodeURIComponent(req.originalUrl));
    }
  }
  try {
    if (req && (req.method === 'POST' || req.method === 'PUT') && req.body) {
      sails.log.verbose(
        `REQUEST [${req.method}]: "${req.url}" body: ${JSON.stringify(req.body)}`
      );
    } else {
      sails.log.verbose(`REQUEST [${req.method}]: "${req.url}"`);
    }
  } catch (err) {
    sails.log.warn(err);
  }
  return proceed();
};
