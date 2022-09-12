const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Login',


  description: 'Login admin.',


  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    rememberMe: {
      type: 'boolean',
      defaultsTo: false
    }
  },


  exits: {
    badCombo: {
      responseType: 'unauthorised',
    },
    notFound: {
      statusCode: 404,
    }
  },


  fn: async function (inputs, exits) {
    return exits.notFound(); // Login.js remove from app for firebase.
    // const user = await User.findOne({
    //   email: inputs.emailAddress,
    // });

    // if (!user) {
    //   throw 'badCombo';
    // }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.password);
    // if (!isValidPassword) {
    //   throw 'badCombo';
    // }

    // // Update the session
    // this.req.session.userId = user.id;

    // return user;
  }


};
