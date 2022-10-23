module.exports = {


  friendlyName: 'View login',


  description: 'Display "Login" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/login'
    }

  },


  fn: async function (inputs, exits) {

    if(this.req.session.userId){
      return this.res.redirect('/admin'); // Have to do this as view routes do not hit policies.
    }

    // Respond with view.
    return exits.success({});

  }


};
