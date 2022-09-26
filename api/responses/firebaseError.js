/**
 * unauthorised.js
 *
 * A custom response that content-negotiates the current request to either:
 *  • log out the current user and redirect them to the login page
 *  • or send back 401 (Unauthorised) with no response body.
 *
 * Example usage:
 * ```
 *     return res.unauthorised();
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       badCombo: {
 *         description: 'That email address and password combination is not recognized.',
 *         responseType: 'firebaseError'
 *       }
 *     }
 * ```
 */
module.exports = function firebaseError() {

  var req = this.req;
  var res = this.res;

  sails.log.verbose('Ran custom response: res.firebaseError()');

  if (req.wantsJSON) {
    return res.sendStatus(401);
  }
  // Or log them out (if necessary) and then redirect to the login page.
  else {

    if (req.session.userId) {
      delete req.session.userId;
    }

    return res.redirect('/admin/login');
  }

};
