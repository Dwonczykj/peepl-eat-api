import { WaitingListEntryType } from "../../../scripts/utils";
import { SailsModelType, sailsVegi } from "../../interfaces/iSails";

declare var sails: sailsVegi;

declare var WaitingList: SailsModelType<WaitingListEntryType>;

export type SendSmsInputs = {
  toPhone: `+${number}`; //  E.164 format (for example, +12025551234)
  message: string;
};

module.exports = {
  friendlyName: 'Send SMS',

  inputs: {
    toPhone: {
      type: 'string',
      required: true,
    },
    message: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    userExists: {
      responseType: 'unauthorised',
      description: 'A user is already registered to the details requested',
    },
    success: {
      outputDescription: '',
      outputExample: {},
      data: null,
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
    },
  },

  fn: async function (
    inputs: SendSmsInputs,
    exits: {
      userExists;
      success;
      firebaseErrored;
      error;
    }
  ) {
    try {
      await sails.helpers.sendSmsNotification.with({
        body: inputs.message,
        to: inputs.toPhone,
        data: {},
      });
    } catch (error) {
      sails.log.error(
        `There was an error sending an SMS to '${inputs.toPhone}': ${error}`
      );
    }
    
    return exits.success();
  },
};
