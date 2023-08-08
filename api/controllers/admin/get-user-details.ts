import { UserType } from "../../../scripts/utils";
import { SailsModelType } from "../../interfaces";

declare var User: SailsModelType<UserType>;

module.exports = {


  friendlyName: 'Get user details',


  description: '',


  inputs: {
    email: {
      type: 'string',
      required: true
    },
    phoneNoCountry: {
      type: 'string',
      required: true
    }
  },


  exits: {
    success: {
      outputDescription: '`User`s vendor role status',
      outputExample: {
        isOwner: false,
        vendorID: 0,
      }
    },
    unauthorised: {
      description: 'You are not authenticated',
      responseType: 'unauthorised'
    },
    notFound: {
      responseType: 'notFound'
    },
    badCombo: {
      responseType: 'unauthorised',
    },
  },


  fn: async function (inputs, exits) {

    let users = await User.find({
      // email: { contains: `%${inputs.email}%` },
      phoneNoCountry: inputs.phoneNoCountry,
    });
    
    if (!users || users.length < 1) {
      sails.log.warn(`No user found for inputs: \n${JSON.stringify(inputs, null, 2)}`);
      return exits.notFound();
    }
    let user = users[0];

    if(users.length > 1){
      const matchingEmails = users.filter((u) => u.email.toLowerCase() === inputs.email);
      if(matchingEmails  && matchingEmails.length > 0){
        user = matchingEmails[0];
      } else {
        sails.log.warn(`get-user-details matched a phone number to request: "${inputs.phoneNoCountry}", but not could not match email: "${inputs.email}"`);
      }
    }

    // Update the session
    this.req.session.userId = user.id;

    return exits.success(user);

  }


};
