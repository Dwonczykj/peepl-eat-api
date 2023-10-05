/**
 * is-vendor
 *
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  if (!req.session.userId) {
    sails.log.info('Policy:<is-vendor> -> redirect to admin as not logged in');
    if (req.wantsJSON) {
      return res.forbidden();
    } else {
      return res.redirect('/admin/login');
    }
  }

  const user = await User.findOne({
    id: req.session.userId,
  });

  if (user.role === 'vendor' || user.isSuperAdmin) {
    return proceed();
  }

  sails.log.info('Policy:<is-vendor> -> redirect to admin as not a vendor');
  if (req.wantsJSON) {
    return res.forbidden();
  } else {
    return res.redirect('/admin/login');
  }
};
