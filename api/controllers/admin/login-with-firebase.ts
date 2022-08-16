import { browserSessionPersistence, getAuth, setPersistence, signInWithCustomToken } from "firebase/auth";


// const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Login',


  description: 'Login admin.',


  inputs: {
    // emailAddress: {
    //   type: 'string',
    //   required: true,
    //   isEmail: true,
    // },
    // password: {
    //   type: 'string',
    //   required: true,
    // },
    firebaseSessionToken: {
      type: 'string',
      required: true,
    },
    rememberMe: {
      type: 'boolean',
      defaultsTo: false
    }
  },


  exits: {
    badCombo: {
      responseType: 'unauthorised',
    }
  },


  fn: async function (inputs, exits) {


    const auth = getAuth();

    // const user = await signInWithEmailAndPassword(auth, inputs.email, inputs.password)
    if (!inputs.rememberMe) {
      const user = await setPersistence(auth, browserSessionPersistence)
        .then(() => {
          // Existing and future Auth states are now persisted in the current
          // session only. Closing the window would clear any existing state even
          // if a user forgets to sign out.
          // ...
          // New sign-in will be persisted with session persistence.
          // return signInWithEmailAndPassword(auth, email, password);
          return signInWithCustomToken(auth, inputs.firebaseSessionToken);
        })
        .then((userCredential) => {
          // Signed in 
          const fbUser = userCredential.user;

          return User.update({ phone: fbUser.phoneNumber })
            .set({ firebaseSessionToken: inputs.firebaseSessionToken });
        })
        .then((user) => {
          // Update the session
          this.req.session.userId = user.id;
          return user;
        })
        .catch((error) => {
          throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
        });
      return user;
    } else {
      const user = await signInWithCustomToken(auth, inputs.firebaseSessionToken)
        .then((userCredential) => {
          // Signed in 
          const fbUser = userCredential.user;

          return User.update({ phone: fbUser.phoneNumber })
            .set({ firebaseSessionToken: inputs.firebaseSessionToken });
        })
        .then((user) => {
          // Update the session
          this.req.session.userId = user.id;
          return user;
        })
        .catch((error) => {
          throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
        });
      return user;
    }





    // if(!user){
    //   throw 'badCombo';
    // }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.password);
    // if(!isValidPassword){
    //   throw 'badCombo';
    // }


  }


};
