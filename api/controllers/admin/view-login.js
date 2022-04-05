module.exports = {


  friendlyName: 'View login',


  description: 'Display "Login" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/login'
    }

  },


  fn: async function () {

    if(this.req.session.userId){
      return this.res.redirect('/admin');
    }

    // Respond with view.
    return {};

  }


};
