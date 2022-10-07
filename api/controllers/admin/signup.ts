declare var User: any;
// const bcrypt = require('bcrypt');
module.exports = {
  friendlyName: "Registration",

  description: "Registration administration.",

  inputs: {
    emailAddress: {
      type: "string",
      required: false,
      isEmail: true,
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
      statusCode: 401,
    },
    userExists: {
      responseType: "unauthorised",
      statusCode: 401,
      description: "A user is already registered to the phone number requested",
    },
    badRolesRequest: {
      responseType: "badRequest",
      statusCode: 403,
      description:
        "Register request passed with string roles that do not exist on the roles/vendorRoles/deliveryPartnerRoles of a User",
    },
    success: {
      outputDescription: "",
      statusCode: 200,
      outputExample: {},
      data: null,
    },
  },

  fn: async function (inputs, exits) {
    if (
      !["admin", "owner", "inventoryManager", "salesManager", "none"].includes(
        inputs.vendorRole
      )
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
    if (inputs.emailAddress) {
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
    } else {
      const existingUser = await User.findOne({
        phoneNoCountry: inputs.phoneNoCountry,
        phoneCountryCode: inputs.phoneCountryCode,
      });

      if (existingUser) {
        return exits.userExists();
      }
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
      firebaseSessionToken: "REGISTERING_USER",
    }).fetch();

    return exits.success({ data: user });
  },
};
