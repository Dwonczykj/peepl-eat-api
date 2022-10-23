import { getAuth } from "firebase-admin/auth";

module.exports = {
  friendlyName: "Login with Password",

  description: "Login admin.",

  inputs: {
    emailAddress: {
      type: "string",
      required: true,
      isEmail: true,
    },
    firebaseSessionToken: {
      type: "string",
      required: true,
    },
    rememberMe: {
      description: "Whether to extend the lifetime of the user's session.",
      extendedDescription: `Note that this is NOT SUPPORTED when using virtual requests (e.g. sending
requests over WebSockets instead of HTTP).`,
      type: "boolean",
      defaultsTo: false,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      data: null,
      message: "success",
    },
    firebaseUserNoEmail: {
      statusCode: 404,
      responseType: 'notFound'
    },
    firebaseErrored: {
      responseType: "firebaseError",
      statusCode: 401,
      description: "firebase errored on verifying the user token",
      code: null,
      message: "error",
      error: null,
    },
    badCombo: {
      statusCode: 401,
      responseType: "unauthorised",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.info("Entered login-with-password controller method");

    try {
      const user = await User.findOne({
        email: inputs.emailAddress,
      });

      if (!user) {
        return exits.badCombo();
      }

      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(
        inputs.firebaseSessionToken
      );

      const email = inputs.emailAddress;
      const rememberMe = inputs.rememberMe;

      const firebaseEmail = decodedToken.email;
      if (!firebaseEmail) {
        return exits.firebaseUserNoEmail();
      }

      if (email !== firebaseEmail) {
        return exits.badCombo(); // email doesnt match, throw badCombo
      }

      if (rememberMe) {
        if (this.req.isSocket) {
          sails.log.warn(
            "Received `rememberMe: true` from a virtual request, but it was ignored\n" +
              "because a browser's session cookie cannot be reset over sockets.\n" +
              "Please use a traditional HTTP request instead."
          );
        } else {
          this.req.session.cookie.maxAge =
            sails.config.custom.rememberMeCookieMaxAge;
        }
      }

      // Modify the active session instance.
      // (This will be persisted when the response is sent.)
      this.req.session.userId = user.id;

      // In case there was an existing session (e.g. if we allow users to go to the login page
      // when they're already logged in), broadcast a message that we can display in other open tabs.
      if (sails.hooks.sockets) {
        // sails.helpers.broadcastSessionChange(this.req);
      }

      return exits.success(user);
    } catch (err) {
      sails.log.info(err);
      if (err.code === "auth/wrong-password") {
        return exits.badCombo();
      }
      return exits.firebaseErrored({
        code: err.code,
        message: err.message,
        error: err,
      }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
    }
  },
};
