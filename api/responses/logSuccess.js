/**
 * success.js
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
module.exports = function logSuccess() {
  // var req = this.req;
  var res = this.res;
  sails.log.info(res.statusCode);
  return res.success();
};
