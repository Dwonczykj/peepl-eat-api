import { UserType } from "../../../scripts/utils";
import { SailsModelType } from "../../interfaces";

declare var User: SailsModelType<UserType>;

module.exports = {
  friendlyName: 'Get user details',

  description: '',

  inputs: {
    email: {
      type: 'string',
      required: false,
    },
    phoneNoCountry: {
      type: 'string',
      required: false,
    },
    userId: {
      type: 'number',
      required: false,
    }
  },

  exits: {
    success: {
      outputDescription: '`User`s vendor role status',
      outputExample: {
        isOwner: false,
        vendorID: 0,
      },
    },
    unauthorised: {
      description: 'You are not authenticated',
      responseType: 'unauthorised',
    },
    notFound: {
      responseType: 'notFound',
    },
    badCombo: {
      responseType: 'unauthorised',
    },
  },

  fn: async function (inputs, exits) {
    if (!inputs.email && !inputs.phoneNoCountry && !inputs.userId) {
      return exits.badCombo();
    }

    let users = [];
    if(inputs.userId){
      users = await User.find({
        id: inputs.userId,
      });
    }
    else if (inputs.phoneNoCountry){
      users = await User.find({
        // email: { contains: `%${inputs.email}%` },
        phoneNoCountry: inputs.phoneNoCountry,
      });
    } else {
      users = await User.find({
        // email: { contains: `%${inputs.email}%` },
        email: inputs.email,
      });
    }

    if (!users || users.length < 1) {
      sails.log.warn(
        `No user found for inputs: \n${JSON.stringify(inputs, null, 2)}`
      );
      return exits.notFound();
    }
    let user = users[0];

    if (users.length > 1) {
      const matchingEmails = users.filter(
        (u) => u.email.toLowerCase() === inputs.email
      );
      if (matchingEmails && matchingEmails.length > 0) {
        user = matchingEmails[0];
      } else {
        sails.log.warn(
          `get-user-details matched a phone number to request: "${inputs.phoneNoCountry}", but not could not match email: "${inputs.email}"`
        );
      }
    }

    // Update the session
    this.req.session.userId = user.id;

    return exits.success(user);
  },
};
