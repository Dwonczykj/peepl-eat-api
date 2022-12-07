import { WaitingListEntryType } from "../../../scripts/utils";
import { SailsModelType, sailsVegi } from "../../../api/interfaces/iSails";

declare var sails: sailsVegi;

declare var WaitingList: SailsModelType<WaitingListEntryType>;

module.exports = {
  friendlyName: 'Register Email to Waiting List',

  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
      isEmail: true,
    },
    userType: {
      type: 'string',
      required: false,
      defaultsTo: 'unknown',
    },
    origin: {
      type: 'string',
      isIn: ['mobile', 'vegiapp.co.uk', 'guide', 'leaflet', 'instagram', ''],
      required: false,
      defaultsTo: '',
    },
    sendVerificationCode: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
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
    inputs: {
      emailAddress: string;
      userType: WaitingListEntryType['userType'];
      origin: WaitingListEntryType['origin'];
      sendVerificationCode: boolean;
    },
    exits: {
      userExists;
      success;
      firebaseErrored;
      error;
    }
  ) {
    try {
      await WaitingList.create({
        email: inputs.emailAddress,
        type: inputs.userType,
        origin: inputs.origin,
      });
    } catch (error) {
      sails.log.warn(
        `There was an issue registering [${inputs.userType}] user: ${inputs.emailAddress} with error: ${error}`
      );
    }

    try {
      await sails.helpers.sendTemplateEmail.with({
        template: 'email-registration-waiting-list',
        templateData: {
          message: `Thank you for signing up to vegi. We will be in touch as soon as vegi is ready to transform the future.`,
        },
        subject: 'Welcome to vegi! 💚',
        to: inputs.emailAddress,
        layout: false,
      });
    } catch (error) {
      sails.log.error(
        `There was an error sending a confirmation of waiting list registration email to the user: ${error}`
      );
    }

    try {
      await sails.helpers.sendTemplateEmail.with({
        template: 'email-registration-waiting-list',
        templateData: {
          message: `${inputs.emailAddress} has signed up to vegi via ${inputs.origin}`,
        },
        subject: `New Registration to WaitingList -> ${inputs.emailAddress}`,
        to: 'hello@vegiapp.co.uk',
        layout: false,
      });
    } catch (error) {
      sails.log.error(
        `There was an error sending a confirmation of waiting list registration email to the user: ${error}`
      );
    }
    return exits.success();
  },
};
