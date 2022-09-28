import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
declare var User: any;
// const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Registration with email and password',


  description: 'Registration administration.',


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
      description: 'A user is already registered to the details requested'
    },
    success: {
      outputDescription: '',
      outputExample: {},
      data: null,
    }
  },


  fn: async function (inputs, exits) {
    const existingUser = await User.findOne({
      phoneNoCountry: inputs.phoneNoCountry,
      phoneCountryCode: inputs.phoneCountryCode,
    });

    if (existingUser) {
      throw 'userExists';
    }

    //TODO: Signup the user in firebase
    const auth = getAuth();
    const email = inputs.email;
    const password = inputs.password;
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in 
        const fbUser = userCredential.user;

        const sessionToken = fbUser.getIdToken(true);

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
          firebaseSessionToken: sessionToken,
          fbUid: fbUser.uid,
        });
        exits.success({ data: user });
        return user;
      })
      .catch((error) => {
        sails.log.info(error);
        // if (error.code === 'auth/wrong-password') {
        //   return exits.badCombo();
        // }
        return exits.firebaseErrored({ code: error.code, message: error.message, error: error }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      });


  }
};
