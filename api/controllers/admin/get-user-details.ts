declare var User: any;

module.exports = {


  friendlyName: 'Get user details',


  description: '',


  inputs: {
    email: {
      type: 'string',
      required: true
    },
    phoneNoCountry: {
      type: 'string',
      required: true
    }
  },


  exits: {
    success: {
      outputDescription: '`User`s vendor role status',
      outputExample: {
        isOwner: false,
        vendorID: 0,
      }
    },
    unauthorised: {
      description: 'You are not authenticated',
      responseType: 'unauthorised'
    },
    notFound: {
      responseType: 'notFound'
    },
    badCombo: {
      responseType: 'unauthorised',
    },
  },


  fn: async function (inputs, exits) {
    const user = await User.findOne({
      email: inputs.email,
      phoneNoCountry: inputs.phoneNoCountry,
    });

    if (!user) {
      sails.log.warn(`No user found for inputs: \n${JSON.stringify(inputs, null, 2)}`);
      return exits.notFound();
    }

    // Update the session
    this.req.session.userId = user.id;

    return exits.success(user);

  }


};
