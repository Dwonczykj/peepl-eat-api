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
    sails.log(
      `Policy:<is-super-admin> -> [${req.method}]: "${req.url}" redirect to default root as no active session`
    );
    if (req.wantsJSON) {
      return res.forbidden();
    } else {
      return res.redirect('/home');
    }
  }

  const user = await User.findOne({
    id: req.session.userId,
  });

  if(user && user.isSuperAdmin){
    return proceed();
  }

  sails.log(
    `Policy:<is-super-admin> -> redirect [${req.method}]: "${req.url}" to login as user is not an admin`
  );
  if (req.wantsJSON) {
    return res.forbidden();
  } else {
    return res.redirect('/home');
  }
};
