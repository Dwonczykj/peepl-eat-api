import { SailsModelType } from "../../../api/interfaces/iSails";
import { UserType } from "../../../scripts/utils";

// const bcrypt = require('bcrypt');
declare var User: SailsModelType<UserType>;
module.exports = {


  friendlyName: 'Login With Secret',


  description: 'Endpoint for service accounts and tests to login to without requiring firebase',


  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    secret: {
      type: 'string',
      required: true,
    }
  },


  exits: {
    success: {
      statusCode: 200,
      data: null,
      message: 'success'
    },
    badCombo: {
      statusCode: 401,
      description: `The provided service name and secret combination does not
      match any service account.`,
      responseType: 'unauthorised',
    }
  },


  fn: async function (inputs, exits) {

    // Look up by the email address.
    // (note that we lowercase it to ensure the lookup is always case-insensitive,
    // regardless of which database we're using)
    var userRecord = await User.findOne({
      name: inputs.name,
    });


    // If there was no matching user, respond thru the "badCombo" exit.
    if (!userRecord) {
      return exits.badCombo();
    }

    // sails.log.info('Service User record located for ' + inputs.name);

    // Check secret matches the secret stored against the user
    // If the password doesn't match, then also exit thru "badCombo".
    // await sails.helpers.passwords.checkPassword(inputs.secret, userRecord.secret)
    //   .intercept('incorrect', 'badCombo');
    if (!userRecord.secret || !inputs.secret || inputs.secret !== userRecord.secret) {
      return exits.badCombo();
    }

    this.req.session.userId = userRecord.id;
    this.req.session.userRole = userRecord.role;
    return exits.success(userRecord);

    // const user = await signInWithEmailAndPassword(auth, inputs.email, inputs.password)
    // if(!user){
    //   return exits.badCombo();
    // }

    // const isValidPassword = await bcrypt.compare(inputs.password, user.password);
    // if(!isValidPassword){
    //   return exits.badCombo();
    // }


  }


};
