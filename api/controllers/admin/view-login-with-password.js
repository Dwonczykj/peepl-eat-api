module.exports = {


  friendlyName: 'View login with password',


  description: 'Display "Login" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/login-with-password'
    }

  },


  fn: async function () {

    if (this.req.session.userId) {
      return this.res.redirect('/admin');
    }

    // Respond with view.
    return {};

  }


};
