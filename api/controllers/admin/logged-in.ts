module.exports = {


  friendlyName: 'Logged in',


  description: 'Logged in',


  inputs: {

  },


  exits: {
    success: {
      data: false,
    }
  },


  fn: async function (inputs, exits) {
    return exits.success({data:!!this.req.session.userId});
  }


};
