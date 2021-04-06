/**
 * has-wallet
 *
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  if (!req.session.walletId && !req.param('wallet')) {
    return res.redirect('/');
  } else {
    req.session.walletId = req.param('wallet') || req.session.walletId;
    return proceed();
  }
};
