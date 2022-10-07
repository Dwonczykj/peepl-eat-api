module.exports = {


  friendlyName: 'Check user for phone',


  description: 'Check whether a user exists for a phone number',


  inputs: {
    countryCodeNoFormat: {
      type: 'number',
      required: true,
    },
    phoneNoCountryNoFormat: {
      type: 'number',
      required: true,
    },
  },


  exits: {
    success: {
      // outputDescription: '`User exists',
      outputExample: true,
      statusCode: 200,
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
      phoneNoCountry: inputs.phoneNoCountryNoFormat,
      phoneCountryCode: inputs.countryCodeNoFormat,
    });

    if (!user) {
      // return exits.badCombo();
      return exits.success(false);
    }

    return exits.success(true);
  }


};
