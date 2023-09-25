import { DecodedIdToken } from 'firebase-admin/auth';
import * as firebase from '../../../config/firebaseAdmin';
//TODO: Consider connecting Passport to Google Auth Flow: https://stackoverflow.com/q/34069046
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  UserType
} from '../../../scripts/utils';
import HttpStatus from '../../interfaces/httpStatusCodes';

const splitPhoneNumber = (formattedFirebaseNumber:string) => {
  try {
    let countryCode;
    let phoneNoCountry;
    if((formattedFirebaseNumber.startsWith('00') || formattedFirebaseNumber.startsWith('+')) && formattedFirebaseNumber.length <= 12){
      countryCode = Number.parseInt(
        formattedFirebaseNumber.match(/^(\+|00)(\d{1})/g)[0]
      );
      phoneNoCountry = 
        formattedFirebaseNumber.replace(/-/g, "").match(/(\d{1,10})$/g)[0]; // min of 1 digits as number might be 000-000-0001
    } else {
      countryCode = Number.parseInt(
        formattedFirebaseNumber.match(/^(\+|00)(\d{1,2})/g)[0]
      );
      phoneNoCountry = 
        formattedFirebaseNumber.replace(/-/g, "").match(/(\d{1,10})$/g)[0]; // min of 1 digits as number might be 000-000-0001
    }
    return {
      countryCode,
      phoneNoCountry,
    };
  } catch (unused) {
    return {
      countryCode: -1,
      phoneNoCountry: '9999999999',
    };
  }
};


declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;


export type LoginWithFirebaseInputs = {
  phoneNoCountry: string;
  phoneCountryCode: number;
  firebaseSessionToken: string;
  rememberMe: boolean;
};

export type LoginWithFirebaseResponse = {
  user: UserType | sailsModelKVP<UserType>;
  session: string;
} | false;

export type LoginWithFirebaseExits = {
  success: (unusedData: LoginWithFirebaseResponse) => any;
  logSuccess: (unusedData: LoginWithFirebaseResponse) => any;
  // issue: (unusedErr: Error | String) => void;
  // notFound: () => void;
  // error: (unusedErr?: Error | String) => void;
  // badRequest: (unusedErr?: Error | String) => void;
  firebaseUserNoPhone: (unusedErr?: Error | String) => void;
  firebaseUserNoPhoneInDecodedToken: (unusedErr?: Error | String) => void;
  firebaseErrored: (
    unusedErr?:
      | {
          code: string;
          message: string;
          error: Error | string;
        }
      | undefined
  ) => void;
  firebaseIdTokenExpired: (
    unusedErr?:
      | {
          code: string;
          message: string;
          error: Error | string;
        }
      | undefined
  ) => void;
  firebaseVerificationCodeExpired: (
    unusedErr?:
      | {
          code: string;
          message: string;
          error: Error | string;
        }
      | undefined
  ) => void;
  badCombo: (unusedErr?: Error | String) => void;
  badEmailFormat: (unusedErr?: Error | String) => void;
  serverError: (unusedErr?: {
    data: {
      code: string;
      message: string;
      error: Error | string;
    };
  }) => void;
};

const _exports: SailsActionDefnType<
  LoginWithFirebaseInputs,
  LoginWithFirebaseResponse,
  LoginWithFirebaseExits
> = {
  friendlyName: 'Login With Firebase',
  description: 'Firebase Login admin.',

  inputs: {
    phoneNoCountry: {
      type: 'string',
      required: true,
    },
    phoneCountryCode: {
      type: 'number',
      required: true,
    },
    firebaseSessionToken: {
      type: 'string',
      required: true,
    },
    rememberMe: {
      description: "Whether to extend the lifetime of the user's session.",
      extendedDescription: `Note that this is NOT SUPPORTED when using virtual requests (e.g. sending
requests over WebSockets instead of HTTP).`,
      type: 'boolean',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      data: null,
      message: 'success',
    },
    logSuccess: {
      statusCode: 200,
      data: null,
      message: 'success',
    },
    firebaseUserNoPhone: {
      statusCode: 400,
    },
    firebaseErrored: {
      responseType: 'firebaseError',
      statusCode: 401,
      description: 'firebase errored on verifying the user token',
      code: null,
      message: 'error',
      error: null,
    },
    firebaseIdTokenExpired: {
      statusCode: 401,
      description: 'firebase ID token has expired',
      message: 'error',
      error: null,
    },
    firebaseVerificationCodeExpired: {
      statusCode: 401,
      description: 'firebase ID token has expired',
      message: 'error',
      error: null,
    },
    badCombo: {
      statusCode: 401,
      responseType: 'unauthorised',
    },
    badEmailFormat: {
      statusCode: HttpStatus.BAD_REQUEST,
    },
    serverError: {
      statusCode: 500,
      data: null,
    },
    firebaseUserNoPhoneInDecodedToken: {
      statusCode: 400,
    },
  },

  /*
   * First authenticate backend service account:
   * ~ https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
   * Second use this idToken from the user with the Firebase Admin SDK: getAuth().verifyIdToken(idToken)
   */
  fn: async function (inputs, exits) {
    const _completeLogin = (user: sailsModelKVP<UserType> | UserType) => {
      // Modify the active session instance.
      // (This will be persisted when the response is sent.)
      this.req.session.userId = user.id;
      this.req.session.userRole = user.role;

      // In case there was an existing session (e.g. if we allow users to go to the login page
      // when they're already logged in), broadcast a message that we can display in other open tabs.
      if (sails.hooks.sockets) {
        // sails.helpers.broadcastSessionChange(this.req);
      }

      return exits.success({
        user: user,
        session: this.req.session.cookie,
      });
    };
    const inputPhoneDetails = {
      phoneNoCountry: inputs.phoneNoCountry,
      phoneCountryCode: inputs.phoneCountryCode,
    };
    const testPhoneNumbers = `${sails.config.custom.testPhoneNumbers}`.split(',');
    if (
      // process.env.NODE_ENV !== 'production' &&
      `+${inputs.phoneCountryCode}` ===
        sails.config.custom.testPhoneNumberCountryCode.toString() &&
      testPhoneNumbers.includes(inputs.phoneNoCountry.toString())&&
      inputs.firebaseSessionToken ===
        sails.config.custom.testFirebaseSessionToken
    ) {
      try {
        sails.log.warn(
          `Login-with-firebase called using test phone and credentials`
        );
        // const inputPhoneDetails = splitPhoneNumber(inputs.phoneNumber);

        // * return the test consumer user for testing purposes only
        let _users: Array<sailsModelKVP<UserType> | UserType> = await User.find(
          {
            phoneNoCountry: inputPhoneDetails.phoneNoCountry,
            phoneCountryCode: inputPhoneDetails.phoneCountryCode,
            firebaseSessionToken: inputs.firebaseSessionToken,
          }
        );
        if (!_users || _users.length < 1) {
          const _user = await User.create({
            email: 'test_user_email_1@example.com',
            isSuperAdmin: false,
            isTester: true,
            secret: '',
            firebaseSessionToken: inputs.firebaseSessionToken,
            phoneNoCountry: inputPhoneDetails.phoneNoCountry,
            phoneCountryCode: inputPhoneDetails.phoneCountryCode,
            fbUid: '',
            marketingEmailContactAllowed: true,
            marketingPushContactAllowed: true,
            marketingSMSContactAllowed: true,
            name: 'test_user_1',
            role: 'consumer',
          }).fetch();
          return _completeLogin(_user);
        }
        const _user = _users[0];
        return _completeLogin(_user);
      } catch (err) {
        sails.log.error(
          `Failed to authorise test phoneNumber and firebaseSessionToken with error: ${err}`
        );
        sails.log.info(err);
        return exits.badCombo();
      }
    }
    if (
      process.env.useFirebaseEmulator &&
      process.env.useFirebaseEmulator === 'true'
    ) {
      try {
        // const inputPhoneDetails = splitPhoneNumber(inputs.phoneNumber);

        let _user: sailsModelKVP<UserType> | UserType = await User.findOne({
          phoneNoCountry: inputPhoneDetails.phoneNoCountry,
          phoneCountryCode: inputPhoneDetails.phoneCountryCode,
        });
        if (_user) {
          return _completeLogin(_user);
        }
      } catch (err) {
        sails.log.info(err);
        return exits.badCombo();
      }
    }

    var _decodedToken: DecodedIdToken;

    try {
      _decodedToken = await firebase.verifyIdToken(inputs.firebaseSessionToken);
    } catch (err) {
      sails.log.error(
        `Login-with-firebase (phone) failed due to firebaseError: `
      );
      sails.log.error(`${err}`);
      if (err.code === 'auth/id-token-expired') {
        // can we refresh the token ourselves?>...
        return exits.firebaseIdTokenExpired({
          code: err.code,
          message: err.message,
          error: err,
        });
      } else if (err.code === 'auth/code-expired') {
        return exits.firebaseVerificationCodeExpired({
          code: err.code,
          message: err.message,
          error: err,
        });
      }
      return exits.firebaseErrored({
        code: err.code,
        message: err.message,
        error: err,
      }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }

    // Signed in
    const decodedToken = _decodedToken; // * '+44795.........'

    if(!decodedToken){
      sails.log.error(
        `Unable to verify firebase auth credentials in login-with-firebase and decode the token for token: "${inputs.firebaseSessionToken}" (+${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry})`
      );
      return exits.badCombo(
        `Unable to verify firebase auth credentials in login-with-firebase and decode the token for token: "${inputs.firebaseSessionToken}" (+${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry})`
      );
    }

    try {
      try {
        // const inputPhoneDetails = splitPhoneNumber(inputs.phoneNumber);

        const formattedFirebaseNumber = decodedToken.phone_number;
        // if (!formattedFirebaseNumber) {
        //   sails.log.error(
        //     `Login-with-firebase (phone) failed due to no firebase user existing with input phonenumber.`
        //   );

        //   return exits.firebaseUserNoPhoneInDecodedToken();
        // }
        if (
          formattedFirebaseNumber &&
          formattedFirebaseNumber !==
            `+${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry}`
        ) {
          sails.log.error(
            `Login-with-firebase (phone) failed due because phone details stored against firebase user (${formattedFirebaseNumber}) does not match request input phone number (+${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry})`
          );
          return exits.badCombo(
            `Login-with-firebase (phone) failed due because phone details stored against firebase user (${formattedFirebaseNumber}) does not match request input phone number (+${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry})`
          ); 
        }

        let user: sailsModelKVP<UserType> | UserType = await User.findOne({
          // ! why is this not finding my number in the db...
          phoneNoCountry: inputPhoneDetails.phoneNoCountry,
          phoneCountryCode: inputPhoneDetails.phoneCountryCode,
        });
        if (!user) {
          sails.log.info(
            `Could not locate user for phone: ${formattedFirebaseNumber} in login-with-firebase`
          );
          const newEmail = decodedToken.email || '';
          const _existingUserSameEmail = await User.find({
            email: newEmail.trim().toLowerCase(),
          });
          if (_existingUserSameEmail && _existingUserSameEmail.length > 0) {
            const _first = _existingUserSameEmail[0];
            sails.log.error(
              `Unable to create user in login-with-firebase as another user[${_first.id}] already has email "${newEmail}" and the supplied phone number: "${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry}" did not match an existing users phone number.`
            );
            return exits.badCombo(
              `Unable to update user in login-with-firebase as another user[${_first.id}] already has email "${newEmail}" and the supplied phone number: "${inputPhoneDetails.phoneCountryCode}${inputPhoneDetails.phoneNoCountry}" did not match an existing users phone number.`
            );
          }
          let proxyName = '';
          if (newEmail && !newEmail.includes('@')) {
            if (!newEmail.includes('@')) {
              return exits.badEmailFormat('bad email passed');
            }
            proxyName = newEmail.substring(0, newEmail.indexOf('@')).trim();
            if (!proxyName) {
              proxyName = '';
            }
          }
          //create one as using valid firebase token:
          user = await User.create({
            phoneNoCountry: inputPhoneDetails.phoneNoCountry,
            phoneCountryCode: inputPhoneDetails.phoneCountryCode,
            email: newEmail,
            name: proxyName,
            vendor: null,
            vendorConfirmed: false,
            isSuperAdmin: false,
            vendorRole: 'none',
            deliveryPartnerRole: 'none',
            role: 'consumer',
            firebaseSessionToken: inputs.firebaseSessionToken,
            marketingPushContactAllowed: false,
          }).fetch();
          sails.log.info(
            `Created a new user with email: ${user.email} and phone: ${user.phoneNoCountry}`
          );
        }
        // Update the session
        await User.updateOne({
          phoneNoCountry: inputPhoneDetails.phoneNoCountry,
          phoneCountryCode: inputPhoneDetails.phoneCountryCode,
        }).set({
          firebaseSessionToken: inputs.firebaseSessionToken,
          fbUid: decodedToken.uid,
        });

        user = await User.findOne({
          phoneNoCountry: inputPhoneDetails.phoneNoCountry,
          phoneCountryCode: inputPhoneDetails.phoneCountryCode,
        });

        if (
          decodedToken.email &&
          user.email.trim().toLowerCase() !==
            decodedToken.email.trim().toLowerCase()
        ) {
          await User.updateOne({
            phoneNoCountry: inputPhoneDetails.phoneNoCountry,
            phoneCountryCode: inputPhoneDetails.phoneCountryCode,
          }).set({
            email: decodedToken.email.trim().toLowerCase(),
          });
        }

        // If "Remember Me" was enabled, then keep the session alive for
        // a longer amount of time.  (This causes an updated "Set Cookie"
        // response header to be sent as the result of this request -- thus
        // we must be dealing with a traditional HTTP request in order for
        // this to work.)
        if (inputs.rememberMe) {
          if (this.req.isSocket) {
            sails.log.warn(
              'Received `rememberMe: true` from a virtual request, but it was ignored\n' +
                "because a browser's session cookie cannot be reset over sockets.\n" +
                'Please use a traditional HTTP request instead.'
            );
          } else {
            this.req.session.cookie.maxAge =
              sails.config.custom.rememberMeCookieMaxAge;
          }
        }

        return _completeLogin(user);
      } catch (error) {
        sails.log.error(
          `Login-with-firebase (phone) failed due to a vegi-server error: `
        );
        sails.log.error(`${error}`);
        return exits.serverError({
          data: {
            code: error.code,
            message: error.message,
            error: error,
          },
        }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      }
    } catch (error) {
      sails.log.error(
        `Login-with-firebase (phone) failed due to unknown error [Could be firebase or vegi...]: `
      );
      sails.log.error(`${error}`);
      return exits.firebaseErrored({
        code: error.code,
        message: error.message,
        error: error,
      });
    }

    // const user = await signInWithEmailAndPassword(auth, inputs.email, inputs.password)
    // if(!user){
    //   return exits.badCombo();
    // }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.password);
    // if(!isValidPassword){
    //   return exits.badCombo();
    // }
  },
};

module.exports = _exports;
