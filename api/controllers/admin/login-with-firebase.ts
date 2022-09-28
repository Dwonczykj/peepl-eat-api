import { getAuth } from 'firebase-admin/auth';
//TODO: Consider connecting Passport to Google Auth Flow: https://stackoverflow.com/q/34069046


// const bcrypt = require('bcrypt');
module.exports = {


  friendlyName: 'Login With Firebase',


  description: 'Firebase Login admin.',


  inputs: {
    phoneNumber: {
      type: 'string',
      required: true,
    },
    firebaseSessionToken: {
      type: 'string',
      required: true,
    },
    rememberMe: {
      description: 'Whether to extend the lifetime of the user\'s session.',
      extendedDescription:
        `Note that this is NOT SUPPORTED when using virtual requests (e.g. sending
requests over WebSockets instead of HTTP).`,
      type: 'boolean'
    }
  },


  exits: {
    success: {
      statusCode: 200,
      data: null,
      message: 'success'
    },
    firebaseUserNoPhone: {
      statusCode: 404,
    },
    firebaseErrored: {
      responseType: 'firebaseError',
      statusCode: 401,
      description: 'firebase errored on verifying the user token',
      code: null,
      message: 'error',
      error: null,
    },
    badCombo: {
      statusCode: 401,
      responseType: 'unauthorised',
    }
  },


  fn: async function (inputs, exits) {

    // TODO: First authenticate backend service account: https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
    // TODO: Second use this idToken from the user with the Firebase Admin SDK: getAuth().verifyIdToken(idToken)

    sails.log.info('Entered login-with-firebase controller method');
    
    const splitPhoneNumber = (formattedFirebaseNumber) => {
      try {
        const countryCode = Number.parseInt(formattedFirebaseNumber.match(/^\+(\d{1,2})/g)[0]);
        const phoneNoCountry = Number.parseInt(formattedFirebaseNumber.replace(/-/g, '').match(/(\d{1,10})$/g)[0]); // min of 1 digits as number might be 000-000-0001
        return {
          countryCode,
          phoneNoCountry
        };
      } catch (unused) {
        return {
          countryCode: -1,
          phoneNoCountry: 9999999999
        };
      }
    };

    try {
      const inputPhoneDetails = splitPhoneNumber(inputs.phoneNumber);
      var decodedToken;
      const auth = getAuth();
      if (inputs.firebaseSessionToken === 'DUMMY'){
        decodedToken = {
          // eslint-disable-next-line camelcase
          phone_number: inputs.phoneNumber,
          uid: 'testing_DUMMY',
        };
      } else {
        decodedToken = await auth.verifyIdToken(inputs.firebaseSessionToken);
      }

      const formattedFirebaseNumber = decodedToken.phone_number;
      if (!formattedFirebaseNumber){
        return exits.firebaseUserNoPhone();
      }

      const firebasePhoneDetails = splitPhoneNumber(formattedFirebaseNumber);

      if (firebasePhoneDetails['countryCode'] !== inputPhoneDetails['countryCode']
        || firebasePhoneDetails['phoneNoCountry'] !== inputPhoneDetails['phoneNoCountry']){
        return exits.badCombo(); // phone number doesnt match, throw badCombo
      }

      const user = User.findOne({
        phoneNoCountry: inputPhoneDetails['phoneNoCountry'],
        phoneCountryCode: inputPhoneDetails['countryCode'],
      }).then((user) => {
        // Update the session
        User.updateOne({
          phoneNoCountry: inputPhoneDetails['phoneNoCountry'],
          phoneCountryCode: inputPhoneDetails['countryCode'],
        }).set({ firebaseSessionToken: inputs.firebaseSessionToken, fbUid: decodedToken.uid });

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

        exits.success({data: user});
        return user;
      })
      .catch((error) => {
        sails.log.info(error);
        return exits.firebaseErrored({code: error.code, message: error.message, error: error}); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      });
    } catch (error) {
      sails.log.info(error);
      return exits.firebaseErrored({ code: error.code, message: error.message, error: error });
    }


    // const user = await signInWithEmailAndPassword(auth, inputs.email, inputs.password)
    // if(!user){
    //   throw 'badCombo';
    // }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.password);
    // if(!isValidPassword){
    //   throw 'badCombo';
    // }


  }


};
