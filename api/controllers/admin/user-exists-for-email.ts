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
    
    
    const user = await User.findOne({
      email: inputs.email,
    });

    if (!user) {
      // return exits.badCombo();
      exits.success({ data: false });
    }

    exits.success({ message: 'success', data: true });
  }
};
