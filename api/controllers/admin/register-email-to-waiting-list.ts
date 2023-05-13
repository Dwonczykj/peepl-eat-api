import { WaitingListEntryType, datetimeMomentUtcStrTzFormat, datetimeStrFormat } from "../../../scripts/utils";
import { SailsModelType, sailsModelKVP, sailsVegi } from "../../../api/interfaces/iSails";
import { last } from "lodash-es";
import moment from "moment";

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
      success: (waitingListEntry:sailsModelKVP<WaitingListEntryType>) => void;
      firebaseErrored;
      error;
    }
  ) {
    const email = inputs.emailAddress.trim().toLowerCase();
    const _existingWaitingListEntries = await WaitingList.find({
      email: email,
    });
    if (_existingWaitingListEntries && _existingWaitingListEntries.length > 0) {
      return exits.success(_existingWaitingListEntries[0]);
    }
    const getLastPersonInQueue = async () => {
      try {
        const queue = await WaitingList.find({
          onboarded: false,
        }).sort('order');
        const lastPerson = queue && queue.length > 0 ? queue[queue.length-1] : null;
        return lastPerson;
      } catch (error) {
        sails.log.error(error);
        return null;
      }
    };
    
    const lastPerson = await getLastPersonInQueue();
    let newEntry: WaitingListEntryType;
    try {
      newEntry = await WaitingList.create({
        email: inputs.emailAddress,
        userType: inputs.userType,
        origin: inputs.origin,
        positionLastCalculatedTime:
          moment(moment.now()).format('YYYY-MM-DD HH:mm:ss'), // 'yyyy-MM-dd HH:mm:ss'
        // positionLastCalculatedTime: Date.now(),
        onboarded: false,
        personInFront: lastPerson ? lastPerson.id : 0,
        order: lastPerson ? lastPerson.order + 1 : 1,
        emailUpdates: false,
      }).fetch();
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

    try {
      // redirect back to origin if request not wants json
      // const origin = encodeURIComponent(req.originalUrl);
      const origin = this.req.originalUrl;
      if (origin && !this.req.wantsJSON){
        return this.res.redirect(origin);
      }
    } catch (error) {
      sails.log.warn(`Unable to find origin url for reqest: ${error}`);
    }

    if(!newEntry){
      return exits.error();
    }
    return exits.success(newEntry);
  },
};
