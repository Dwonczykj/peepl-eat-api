declare var User: any;
// const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Registration',


  description: 'Registration administration.',


  inputs: {
    emailAddress: {
      type: 'string',
      required: false,
      isEmail: true,
    },
    phoneNoCountry: {
      type: 'number',
      required: true,
    },
    phoneCountryCode: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
    },
    vendorId: {
      type: 'number',
      allowNull: true,
    },
    courierId: {
      type: 'number',
      allowNull: true,
    },
    role: {
      type: 'string',
    },
    vendorRole: {
      type: 'string',
    },
    courierRole: {
      type: 'string',
    },
  },


  exits: {
    FirebaseError: {
      responseType: 'unauthorised',
    },
    userExists: {
      responseType: 'unauthorised',
      description: 'A user is already registered to the phone number requested'
    },
    success: {
      outputDescription: 'The updated opening hours',
      outputExample: {}
    }
  },


  fn: async function (inputs, exits) {
    const existingUser = await User.findOne({
      phoneNoCountry: inputs.phoneNoCountry,
      phoneCountryCode: inputs.phoneCountryCode,
    });

    if(existingUser){
      throw 'userExists';
    }

    // * Create User Wrapper
    const user = await User.create({
      phoneNoCountry: inputs.phoneNoCountry,
      phoneCountryCode: inputs.phoneCountryCode,
      email: inputs.email,
      name: inputs.name,
      // password: 'Testing123!',
      vendor: inputs.vendorId,
      courier: inputs.courierId,
      vendorConfirmed: false,
      isSuperAdmin: false,
      vendorRole: inputs.vendorRole,
      courierRole: inputs.courierRole,
      role: inputs.role,
      firebaseSessionToken: 'REGISTERING_USER',
    });

    return exits.success(user);
  }
};
