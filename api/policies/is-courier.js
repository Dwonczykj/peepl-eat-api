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
    return res.redirect('/admin/login');
  }

  const user = await User.findOne({
    id: req.session.userId,
  });

  if (user.role === 'courier') {
    return proceed();
  }

  return res.redirect('/admin/login/');
};
