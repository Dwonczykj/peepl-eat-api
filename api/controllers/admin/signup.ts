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
    phone: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
    },
    firebaseSessionToken: {
      type: 'string',
      required: true,
    },
    // password: {
    //   type: 'string',
    //   required: true,
    // },
    rememberMe: {
      type: 'boolean',
      defaultsTo: false,
    },
    vendorId: {
      type: 'number',
    },
  },


  exits: {
    FirebaseError: {
      responseType: 'unauthorised',
    }
  },


  fn: async function (inputs, exits) {
    // * Remove the following firebase signup as we now do this client app side and then use the firebase session token from there
    // const auth = getAuth();
    // const user = await createUserWithEmailAndPassword(auth, inputs.emailAddress, inputs.password)
    //   .then((userCredential) => {
    //     // Signed in
    //     const user = userCredential.user;

    //     // * Create User Wrapper
    //     return User.create({
    //       email: user.email,
    //       // password: 'Testing123!',
    //       name: user.email,
    //       vendor: null,
    //       isSuperAdmin: false,
    //       vendorRole: 'none',
    //       role: ''
    //     });
    //   })
    //   .then((newUser) => {
    //     // Update the session
    //     this.req.session.userId = newUser.id;

    //     return newUser;
    //   })
    //   .catch((error) => {
    //     throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    //   });

    // * Create User Wrapper
    const user = await User.create({
      email: inputs.email,
      phone: inputs.phone,
      // password: 'Testing123!',
      name: inputs.name,
      vendor: inputs.vendor,
      isSuperAdmin: false,
      vendorRole: 'none',
      role: '',
      firebaseSessionToken: inputs.firebaseSessionToken,
    });

    return user;
  }


};
