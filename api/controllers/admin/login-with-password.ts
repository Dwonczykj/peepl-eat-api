import { getAuth, signInWithEmailAndPassword } from "firebase/auth";


module.exports = {


  friendlyName: 'Login with Password',


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
    },
    success: {
      statuscode: 200,
      data: null,
    }
  },


  fn: async function (inputs, exits) {
    const user = await User.findOne({
      email: inputs.emailAddress,
    });

    if (!user) {
      return exits.badCombo();
    }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.firebaseSessionToken); //this is only when we used to has the password on user creation
    // const sessionToken = user.firebaseSessionToken;
    // const isValidPassword = inputs.password === sessionToken;
    // if (!isValidPassword) {
    //   return exits.badCombo();
    // }

    const auth = getAuth();
    const email = inputs.emailAddress;
    const password = inputs.password;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const fbUser = userCredential.user;

        sails.log.info(fbUser.email + ' authorised signed in to firebase.');

        return fbUser;
        // ...
      })
      .then((fbUser) => {
        const user = User.findOne({
          email: fbUser.email
        }).then(async (user) => {
          // Update the session
          const sessionToken = await fbUser.getIdToken(true);
          await User.updateOne({
            email: fbUser.email
          }).set({ firebaseSessionToken: sessionToken, fbUid: fbUser.uid });

          // If "Remember Me" was enabled, then keep the session alive for
          // a longer amount of time.  (This causes an updated "Set Cookie"
          // response header to be sent as the result of this request -- thus
          // we must be dealing with a traditional HTTP request in order for
          // this to work.)
          if (inputs.rememberMe) {
            if (this.req.isSocket) {
              sails.log.warn(
                'Received `rememberMe: true` from a virtual request, but it was ignored\n' +
                'because a browser\'s session cookie cannot be reset over sockets.\n' +
                'Please use a traditional HTTP request instead.'
              );
            } else {
              this.req.session.cookie.maxAge = sails.config.custom.rememberMeCookieMaxAge;
            }
          }//ﬁ

          // Modify the active session instance.
          // (This will be persisted when the response is sent.)
          this.req.session.userId = user.id;

          // In case there was an existing session (e.g. if we allow users to go to the login page
          // when they're already logged in), broadcast a message that we can display in other open tabs.
          if (sails.hooks.sockets) {
            // sails.helpers.broadcastSessionChange(this.req);
          }

          exits.success({ data: user });
          return user;
        });
      })
      .catch((error) => {
        sails.log.info(error);
        if (error.code === 'auth/wrong-password') {
          return exits.badCombo();
        }
        return exits.firebaseErrored({ code: error.code, message: error.message, error: error }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      });
  }


};
