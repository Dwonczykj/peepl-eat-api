/**
 * is-super-admin
 *
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  if (!req.session.userId) {
    sails.log('Policy:<is-super-admin> -> redirect to login as no active session');
    if (req.wantsJSON) {
      return res.forbidden();
    } else {
      return res.redirect('/admin/login-with-password');
    }
  }

  const user = await User.findOne({
    id: req.session.userId,
  });

  if(user.isSuperAdmin){
    return proceed();
  }

  sails.log('Policy:<is-super-admin> -> redirect to login as user is not an admin');
  if (req.wantsJSON) {
    return res.forbidden();
  } else {
    return res.redirect('/admin/login');
  }
};
