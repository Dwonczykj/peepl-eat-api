/**
 * is-delivery-partner
 *
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  if (!req.session.userId) {
    sails.log(
      'Policy:<is-delivery-partner> -> redirect to admin as not logged in'
    );
    if (req.wantsJSON) {
      return res.forbidden();
    } else {
      return res.redirect('/admin/login');
    }
  }

  const user = await User.findOne({
    id: req.session.userId,
  });

  if (user.role === 'deliveryPartner' || user.isSuperAdmin) {
    return proceed();
  }

  sails.log(
    'Policy:<is-delivery-partner> -> redirect to admin as not a deliveryPartner'
  );
  if (req.wantsJSON) {
    return res.forbidden();
  } else {
    return res.redirect('/admin/login');
  }
};
