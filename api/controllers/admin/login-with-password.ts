import { DecodedIdToken } from "firebase-admin/auth";
import * as firebase from '../../../config/firebaseAdmin';
import { UserType } from "../../../scripts/utils";
import { SailsModelType, sailsModelKVP, sailsVegi } from "../../../api/interfaces/iSails";


declare var User: SailsModelType<UserType>;
declare var sails: sailsVegi;

export const splitPhoneNumber = (formattedFirebaseNumber: string) => {
  try {
    const countryCode = Number.parseInt(
      formattedFirebaseNumber.match(/^\+(\d{1,2})/g)[0]
    );
    const phoneNoCountry = Number.parseInt(
      formattedFirebaseNumber.replace(/-/g, '').match(/(\d{1,10})$/g)[0]
    ); // min of 1 digits as number might be 000-000-0001
    return {
      countryCode,
      phoneNoCountry,
    };
  } catch (unused) {
    return {
      countryCode: -1,
      phoneNoCountry: 0,
    };
  }
};

type LoginWithPasswordResponse = {
  user: UserType | sailsModelKVP<UserType>;
  session: string;
};

module.exports = {
  friendlyName: 'Login with Password',

  description: 'Login admin.',

  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
      isEmail: true,
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
      defaultsTo: false,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      data: null,
      message: 'success',
    },
    firebaseErrored: {
      responseType: 'firebaseError',
      statusCode: 401,
      description: 'firebase errored on verifying the user token',
      code: null,
      message: 'error',
      error: null,
    },
    error: {
      statusCode: 400,
      description: 'sails backend errored',
      message: 'error',
      error: null,
    },
    badCombo: {
      statusCode: 401,
      responseType: 'unauthorised',
    },
    badCredentials: {
      statusCode: 401,
      responseType: 'unauthorised',
    },
    firebaseUserNoEmail: {
      statusCode: 404,
      responseType: 'notFound',
    },
    firebaseIncorrectEmail: {
      statusCode: 401,
      responseType: 'unauthorised',
    },
    userNeedsToLinkFirebaseAtSignUp: {
      statusCode: 401,
      responseType: 'unauthorised',
    },
  },

  fn: async function (
    inputs: {
      emailAddress: string;
      firebaseSessionToken: string;
      rememberMe: boolean;
    },
    exits: {
      success: (
        unusedArgs: LoginWithPasswordResponse
      ) => LoginWithPasswordResponse;
      firebaseErrored: (unusedArgs: {
        error: any;
        message: string;
        code: string;
      }) => void;
      error: (unusedArgs: { error: any; message: string }) => void;
      badCombo: (unusedErr?: Error) => void;
      badCredentials: () => void;
      firebaseUserNoEmail: () => void;
      firebaseIncorrectEmail: () => void;
      userNeedsToLinkFirebaseAtSignUp: () => void;
    }
  ) {
    const rememberMe = inputs.rememberMe;
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

    if (process.env.useFirebaseEmulator && process.env.useFirebaseEmulator === 'true') {
      try {
        const email = inputs.emailAddress;
        let _user: sailsModelKVP<UserType> | UserType = await User.findOne({
          email: inputs.emailAddress,
        });
        if (_user) {
          return _completeLogin(_user);
        }
      } catch (err) {
        sails.log.info(err);
        return exits.badCredentials();
      }
    }
    var _decodedToken: DecodedIdToken;
    var decodedToken: DecodedIdToken;
    try {
      _decodedToken = await firebase.verifyIdToken(inputs.firebaseSessionToken);
    } catch (err) {
      sails.log.error(err);

      return exits.firebaseErrored({
        code: err.code,
        message: err.message,
        error: err,
      }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }

    // Signed in
    decodedToken = _decodedToken;

    try {
      const email = inputs.emailAddress;
      let _user: sailsModelKVP<UserType> | UserType = await User.findOne({
        email: inputs.emailAddress,
      });


      const firebaseEmail = decodedToken.email;
      if (!firebaseEmail) {
        if (_user) {
          sails.log.info(
            `login-with-password: userNeedsToLinkFirebaseAtSignUp`
          );
          return exits.userNeedsToLinkFirebaseAtSignUp();
        }
        sails.log.info(`login-with-password: firebaseUserNoEmail`);
        return exits.firebaseUserNoEmail();
      }

      if (email !== firebaseEmail) {
        if (_user) {
          sails.log.info(
            `login-with-password: userNeedsToLinkFirebaseAtSignUp`
          );
          return exits.userNeedsToLinkFirebaseAtSignUp();
        }
        sails.log.info(`login-with-password: firebaseIncorrectEmail`);
        return exits.firebaseIncorrectEmail(); // email doesnt match, throw badCombo
      }

      if (!_user) {
        sails.log.info(`No user already exists so creating new user with decoded phone_number from firebase in login-with-password`);
        const fbPhoneDetails = splitPhoneNumber(decodedToken.phone_number);
        _user = await User.create({
          email: inputs.emailAddress,
          name: inputs.emailAddress,
          phoneCountryCode:
            fbPhoneDetails.countryCode ??
            decodedToken.phone_number.replace(/[^0-9]/g, '').substring(0, 2),
          phoneNoCountry:
            fbPhoneDetails.phoneNoCountry ??
            decodedToken.phone_number.replace(/[^0-9]/g, '').substring(2),
          role: `consumer`,
          firebaseSessionToken: inputs.firebaseSessionToken,
          fbUid: decodedToken.uid,
        }).fetch();
        sails.log.info(`Created a new user with email: "${inputs.emailAddress}" and phone: ${_user.phoneNoCountry}`);
      }
      const user = _user;

      if (rememberMe) {
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
    } catch (err) {
      sails.log.info(err);
      if (err.code === 'auth/wrong-password') {
        return exits.badCredentials();
      }
      return exits.error({
        message: err.message,
        error: err,
      });
    }

    //   try { // below would allow login without a firebase user attached. However, we now only support firebase for user management. (No Firebase user, no user)
    //     let _user = await User.findOne({
    //       email: inputs.emailAddress,
    //     });

    //     if (!_user) {
    //       return exits.badCombo();
    //     }
    //     const user = _user;

    //     if (rememberMe) {
    //       if (this.req.isSocket) {
    //         sails.log.warn(
    //           'Received `rememberMe: true` from a virtual request, but it was ignored\n' +
    //             "because a browser's session cookie cannot be reset over sockets.\n" +
    //             'Please use a traditional HTTP request instead.'
    //         );
    //       } else {
    //         this.req.session.cookie.maxAge =
    //           sails.config.custom.rememberMeCookieMaxAge;
    //       }
    //     }

    //     // Modify the active session instance.
    //     // (This will be persisted when the response is sent.)
    //     this.req.session.userId = user.id;

    //     // In case there was an existing session (e.g. if we allow users to go to the login page
    //     // when they're already logged in), broadcast a message that we can display in other open tabs.
    //     if (sails.hooks.sockets) {
    //       // sails.helpers.broadcastSessionChange(this.req);
    //     }

    //     if (inputs.firebaseSessionToken) {
    //       return exits.success(user);
    //     } else {
    //       return exits.badCombo();
    //     }
    //   } catch (err) {
    //     sails.log.info(err);
    //     return exits.badCombo(err);
    //   }
  },
};
