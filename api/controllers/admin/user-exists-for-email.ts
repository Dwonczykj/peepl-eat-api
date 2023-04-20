import { Exits } from '../../interfaces';
module.exports = {
  friendlyName: 'Check user for email',
  description: 'Check whether a user exists for a email',
  inputs: {
    email: {
      type: 'string',
      required: true,
    }
  },
  exits: {
    success: {
      // outputDescription: '`User exists',
      data: null,
      message: 'success',
      outputExample: true,
      statusCode: 200,
    },
    error: {
      message: 'Error!'
    },
    notFound: {
      message: 'user not found',
      responseType: 'notFound'
    },
    badCombo: {
      responseType: 'unauthorised',
    },
  },
  fn: async function (inputs, exits: Exits) {

    sails.log('Running sails with datastore: ' + sails.getDatastore().config.adapter);
    sails.log(JSON.stringify(sails.getDatastore().config));
    
    const user = await User.findOne({
      email: inputs.email,
    });

    if (!user) {
      // return exits.badCombo();
      return exits.success({ data: false });
    }

    return exits.success({ message: 'success', data: true });
  }
};
