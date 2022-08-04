import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Login',


  description: 'Login admin.',


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
    badCombo: {
      responseType: 'unauthorised',
    }
  },


  fn: async function (inputs) {


    const auth = getAuth();
    const user = await signInWithEmailAndPassword(auth, inputs.email, inputs.password)
      .then((userCredential) => {
        // Signed in 
        const fbUser = userCredential.user;

        return User.findOne({
          email: fbUser.email,
        });
      })
      .then((user) => {
        // Update the session
        this.req.session.userId = user.id;
        return User.updateOne(inputs.id).set({
          vendorRole: inputs.vendorRole
        });
      })
      .catch((error) => {
        throw { FirebaseError: [error.code, error.message] }; //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      });

    return user;


    // if(!user){
    //   throw 'badCombo';
    // }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.password);
    // if(!isValidPassword){
    //   throw 'badCombo';
    // }


  }


};
