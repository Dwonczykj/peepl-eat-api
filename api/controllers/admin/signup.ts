import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
declare var User;
const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Registration',


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
    rememberMe: {
      type: 'boolean',
      defaultsTo: false
    }
  },


  exits: {
    FirebaseError: {
      responseType: 'unauthorised',
    }
  },


  fn: async function (inputs) {
    const auth = getAuth();
    const user = await createUserWithEmailAndPassword(auth, inputs.emailAddress, inputs.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;

        // * Create User Wrapper
        return User.create({
          email: user.email,
          // password: 'Testing123!',
          name: user.email,
          vendor: null,
          isSuperAdmin: false,
          vendorRole: 'none',
          role: ''
        });
      })
      .then((newUser) => {
        // Update the session
        this.req.session.userId = newUser.id;

        return newUser;
      })
      .catch((error) => {
        throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      });

    return user;
  }


};
