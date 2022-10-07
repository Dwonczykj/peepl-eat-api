declare var User: any;

module.exports = {


  friendlyName: 'Get user details',


  description: '',


  inputs: {
    email: {
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
    });

    if (!user) {
      return exits.badCombo();
    }

    // Update the session
    this.req.session.userId = user.id;

    return user;

  }


};
