module.exports = {


  friendlyName: 'Logout',


  description: 'Logout admin.',


  inputs: {

  },


  exits: {

  },


  fn: async function () {
    delete this.req.session.userId;

    // All done.
    return this.res.redirect('/admin/login');

  }


};
