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
      return this.res.redirect('/admin');
    }


    let myUser = await User.findOne({ id: this.req.session.userId });

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(
        { user: myUser }
      );
    } else {
      return exits.success({ user: myUser });
    }

  }


};
