module.exports = {


  friendlyName: 'View account',


  description: 'Display "Account Details" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/account'
    },
    successJSON: {
      statusCode: 200,
    }

  },


  fn: async function (inputs, exits) {

    if (!this.req.session.userId) {
      return this.res.redirect('/');
    }


    let user = await User.findOne({ id: this.req.session.userId });

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ user, userRole: this.req.session.userRole });
    } else {
      return exits.success({ user, userRole: this.req.session.userRole });
    }

  }


};
