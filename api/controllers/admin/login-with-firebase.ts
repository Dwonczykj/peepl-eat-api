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

const splitPhoneNumber = (formattedFirebaseNumber:string) => {
  try {
    const countryCode = Number.parseInt(
      formattedFirebaseNumber.match(/^\+(\d{1,2})/g)[0]
    );
    const phoneNoCountry = 
      formattedFirebaseNumber.replace(/-/g, "").match(/(\d{1,10})$/g)[0]; // min of 1 digits as number might be 000-000-0001
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
  phoneNumber: string,
  firebaseSessionToken: string,
  rememberMe: boolean;
};

export type LoginWithFirebaseResponse = {
  user: UserType | sailsModelKVP<UserType>;
  session: string;
} | false;

export type LoginWithFirebaseExits = {
  success: (unusedData: LoginWithFirebaseResponse) => any;
  // issue: (unusedErr: Error | String) => void;
  // notFound: () => void;
  // error: (unusedErr?: Error | String) => void;
  // badRequest: (unusedErr?: Error | String) => void;
  firebaseUserNoPhone: (unusedErr?: Error | String) => void;
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
    phoneNumber: {
      type: 'string',
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
    serverError: {
      statusCode: 500,
      data: null,
    },
  },

  fn: async function (inputs, exits) {
    // TODO: First authenticate backend service account: https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
    // TODO: Second use this idToken from the user with the Firebase Admin SDK: getAuth().verifyIdToken(idToken)

    var _decodedToken: DecodedIdToken;

    try {
      _decodedToken = await firebase.verifyIdToken(inputs.firebaseSessionToken);
    } catch (err) {
      sails.log.error(
        `Login-with-firebase (phone) failed due to firebaseError: `
      );
      sails.log.error(err);
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
    const decodedToken = _decodedToken;

    try {
      try {
        const inputPhoneDetails = splitPhoneNumber(inputs.phoneNumber);

        const formattedFirebaseNumber = decodedToken.phone_number;
        if (!formattedFirebaseNumber) {
          sails.log.error(
            `Login-with-firebase (phone) failed due to no firebase user existing with input phonenumber.`
          );

          return exits.firebaseUserNoPhone();
        }

        const firebasePhoneDetails = splitPhoneNumber(formattedFirebaseNumber);

        if (
          firebasePhoneDetails['countryCode'] !==
            inputPhoneDetails['countryCode'] ||
          firebasePhoneDetails['phoneNoCountry'] !==
            inputPhoneDetails['phoneNoCountry']
        ) {
          sails.log.error(
            `Login-with-firebase (phone) failed due because phone details stored against firebase user does not match request input phone number`
          );
          return exits.badCombo(); // phone number doesnt match, throw badCombo
        }

        let user: sailsModelKVP<UserType> | UserType = await User.findOne({
          // ! why is this not finding my number in the db...
          phoneNoCountry: inputPhoneDetails['phoneNoCountry'],
          phoneCountryCode: inputPhoneDetails['countryCode'],
        });
        if (!user) {
          //create one as using valid firebase token:
          user = await User.create({
            email: decodedToken.email || '', //todo: This email must exist on user..., channge in model...
            // password: 'Testing123!',
            phoneNoCountry: inputPhoneDetails['phoneNoCountry'],
            phoneCountryCode: inputPhoneDetails['countryCode'],
            name: decodedToken.email || inputPhoneDetails['phoneNoCountry'],
            vendor: null,
            vendorConfirmed: false,
            isSuperAdmin: false,
            vendorRole: 'none',
            deliveryPartnerRole: 'none',
            role: 'consumer',
            firebaseSessionToken: inputs.firebaseSessionToken,
            marketingPushContactAllowed: false,
          }).fetch();
        }
        // Update the session
        await User.updateOne({
          phoneNoCountry: inputPhoneDetails['phoneNoCountry'],
          phoneCountryCode: inputPhoneDetails['countryCode'],
        }).set({
          firebaseSessionToken: inputs.firebaseSessionToken,
          fbUid: decodedToken.uid,
        });

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
        } //ﬁ

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
      } catch (error) {
        sails.log.error(
          `Login-with-firebase (phone) failed due to a vegi-server error: `
        );
        sails.log.error(error);
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
      sails.log.error(error);
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
