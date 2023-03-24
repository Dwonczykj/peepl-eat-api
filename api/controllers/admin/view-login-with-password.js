module.exports = {


  friendlyName: 'View login with password',


  description: 'Display "Login" page.',

  inputs: {
    next: {
      required: false,
      type: 'string',
      allowNull: true,
    },
  },


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/login-with-password'
    },
    error: {
      responseType: 'error'
    }

  },


  fn: async function (inputs, exits) {

    if (this.req.session.userId) {
      return this.res.redirect('/admin');
    }

    if(!sails.config.custom.firebaseAPIKey){
      sails.log.error(`Firebase env vars have not been loaded.`);
      return exits.error('Firebase not initialised. Please contact vegi support');
    }

    // Respond with view.
    return exits.success({
      useEmulator: sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST,
      firebaseAPIKey: sails.config.custom.firebaseAPIKey,
      nextUrl: inputs.next,
    });

  }


};
