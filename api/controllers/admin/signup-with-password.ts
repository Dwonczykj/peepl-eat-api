import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
declare var User: any;
// const bcrypt = require('bcrypt');
module.exports = {
  friendlyName: "Registration with email and password",

  description: "Registration administration.",

  inputs: {
    emailAddress: {
      type: "string",
      required: true,
      isEmail: true,
    },
    password: {
      type: "string",
      required: true,
    },
    phoneNoCountry: {
      type: "number",
      required: true,
    },
    phoneCountryCode: {
      type: "number",
      required: true,
    },
    name: {
      type: "string",
    },
    vendorId: {
      type: "number",
      allowNull: true,
    },
    deliveryPartnerId: {
      type: "number",
      allowNull: true,
    },
    role: {
      type: "string",
    },
    vendorRole: {
      type: "string",
      defaultsTo: "none",
    },
    deliveryPartnerRole: {
      type: "string",
      defaultsTo: "none",
    },
  },

  exits: {
    FirebaseError: {
      responseType: "unauthorised",
    },
    userExists: {
      responseType: "unauthorised",
      description: "A user is already registered to the details requested",
    },
    badRolesRequest: {
      responseType: "badRequest",
      statusCode: 403,
      message: 'Bad Roles Supplied to request',
      description: "Register request passed with string roles that do not exist on the roles/vendorRoles/deliveryPartnerRoles of a User"
    },
    success: {
      outputDescription: "",
      outputExample: {},
      data: null,
    },
  },

  fn: async function (inputs, exits) {
      if (
        ![
          "admin",
          "owner",
          "inventoryManager",
          "salesManager",
          "none",
        ].includes(inputs.vendorRole)
      ) {
        return exits.badRolesRequest({
          message: "Bad vendorRole Supplied to request",
        });
      }
      if (
        !["admin", "owner", "deliveryManager", "rider", "none"].includes(
          inputs.deliveryPartnerRole
        )
      ) {
        return exits.badRolesRequest({
          message: "Bad deliveryPartnerRole Supplied to request",
        });
      }
      if (
        !["admin", "vendor", "deliveryPartner", "consumer"].includes(inputs.role)
      ) {
        return exits.badRolesRequest({
          message: "Bad role Supplied to request",
        });
      }

      const existingUser = await User.findOne({
        or: [
          {
            phoneNoCountry: inputs.phoneNoCountry,
            phoneCountryCode: inputs.phoneCountryCode,
          },
          {
            email: inputs.emailAddress,
          },
        ],
      });

    if (existingUser) {
      return exits.userExists();
    }

    //TODO: Signup the user in firebase
    const auth = getAuth();
    const email = inputs.emailAddress;
    const password = inputs.password;
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const fbUser = userCredential.user;

        const sessionToken = fbUser.getIdToken(true);

        const existingUser = await User.findOne({
          or: [
            {
              phoneNoCountry: inputs.phoneNoCountry,
              phoneCountryCode: inputs.phoneCountryCode,
            },
            {
              email: inputs.emailAddress,
            },
            {
              fbUid: fbUser.uid,
            },
          ],
        });

        if (existingUser) {
          return exits.userExists();
        }

        // * Create User Wrapper
        const user = await User.create({
          phoneNoCountry: inputs.phoneNoCountry,
          phoneCountryCode: inputs.phoneCountryCode,
          email: inputs.emailAddress,
          name: inputs.name,
          // password: 'Testing123!',
          vendor: inputs.vendorId,
          deliveryPartner: inputs.deliveryPartnerId,
          vendorConfirmed: false,
          isSuperAdmin: false,
          vendorRole: inputs.vendorRole ?? "none",
          deliveryPartnerRole: inputs.deliveryPartnerRole ?? "none",
          role: inputs.role,
          firebaseSessionToken: sessionToken,
          fbUid: fbUser.uid,
        });
        exits.success({ data: user });
        return user;
      })
      .catch((error) => {
        sails.log.info(error);
        // if (error.code === 'auth/wrong-password') {
        //   return exits.badCombo();
        // }
        return exits.firebaseErrored({
          code: error.code,
          message: error.message,
          error: error,
        }); //https://firebase.google.com/docs/reference/js/auth#autherrorcodes
      });
  },
};
