module.exports = {


  friendlyName: 'Logged in',


  description: 'Logged in',


  inputs: {

  },


  exits: {
    success: {
      data: false,
      statusCode: 200,
      exampleOutput: {
        'data': true
      }
    }
  },


  fn: async function (inputs, exits) {
    return exits.success({authenticated:!!this.req.session.userId});
  }


};
