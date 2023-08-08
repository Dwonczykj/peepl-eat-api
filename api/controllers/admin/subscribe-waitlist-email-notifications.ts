import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  UserType,
  WaitingListEntryType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var WaitingList: SailsModelType<WaitingListEntryType>;
declare var User: SailsModelType<UserType>;


export type SubscribeWaitlistEmailNotificationsInputs = {
  emailAddress: string;
  receiveUpdates: boolean;
  firebaseRegistrationToken: string | null;
};

export type SubscribeWaitlistEmailNotificationsResponse = WaitingListEntryType | false;

export type SubscribeWaitlistEmailNotificationsExits = {
  success: (unusedData: SubscribeWaitlistEmailNotificationsResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  SubscribeWaitlistEmailNotificationsInputs,
  SubscribeWaitlistEmailNotificationsResponse,
  SubscribeWaitlistEmailNotificationsExits
> = {
  friendlyName: 'SubscribeWaitlistEmailNotifications',

  inputs: {
    emailAddress: {
      type: 'string',
      required: true,
    },
    receiveUpdates: {
      type: 'boolean',
      required: true,
    },
    firebaseRegistrationToken: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    issue: {
      statusCode: 403,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
  },

  fn: async function (
    inputs: SubscribeWaitlistEmailNotificationsInputs,
    exits: SubscribeWaitlistEmailNotificationsExits
  ) {
    inputs.receiveUpdates = inputs.receiveUpdates === null ? true : inputs.receiveUpdates;
    const entries = await WaitingList.find({
      email: inputs.emailAddress.toLowerCase(),
    });

    if (!entries || entries.length < 1) {
      const getLastPersonInQueue = async () => {
        try {
          const queue = await WaitingList.find({
            onboarded: false,
          }).sort('order');
          const lastPerson =
            queue && queue.length > 0 ? queue[queue.length - 1] : null;
          return lastPerson;
        } catch (error) {
          sails.log.error(`${error}`);
          return null;
        }
      };
      const lastPerson = await getLastPersonInQueue();
      try {
        await WaitingList.create({
          email: inputs.emailAddress.toLowerCase().trim(),
          emailUpdates: inputs.receiveUpdates,
          firebaseRegistrationToken: inputs.firebaseRegistrationToken,
          origin: 'mobile',
          userType: "consumer",
          positionLastCalculatedTime: moment(moment.now()).format(
            'YYYY-MM-DD HH:mm:ss'
          ), // 'yyyy-MM-dd HH:mm:ss'
          // positionLastCalculatedTime: Date.now(),
          onboarded: false,
          personInFront: (lastPerson ? lastPerson.id : 0) || 0,
          order: (lastPerson ? lastPerson.order + 1 : 1) || 1,
        });
      } catch (error) {
        sails.log.warn(
          `There was an issue subscribing [consumer] user: ${inputs.emailAddress} with error: ${error}`
        );
      }
    } else {
      await WaitingList.update({
        email: inputs.emailAddress.toLowerCase(),
      }).set(
        inputs.firebaseRegistrationToken
          ? {
            emailUpdates: inputs.receiveUpdates,
            firebaseRegistrationToken: inputs.firebaseRegistrationToken,
          }
          : { 
            emailUpdates: inputs.receiveUpdates,
          }
      );
    }
    const updatedEntries = await WaitingList.find({
      email: inputs.emailAddress.toLowerCase(),
    });
    const _finish = () => exits.success(updatedEntries[0]);

    if (this.req.session.userId){
      try {
        const matchingUsers = await User.find({
          email: inputs.emailAddress.trim().toLowerCase(),
        });
        if(!matchingUsers || matchingUsers.length < 1){
          return _finish();
        }
        const _user = matchingUsers[0];
        if (this.req.session.userId !== _user.id) {
          return _finish();
        }
        await User.updateOne({ id: _user.id }).set({
          marketingEmailContactAllowed: inputs.receiveUpdates,
          marketingPushContactAllowed:
            inputs.firebaseRegistrationToken && inputs.receiveUpdates,
        });
      } catch (error) {
        sails.log.error(`Errored when trying to locate users with matching emails after performing a waitlist subscribtion for notifications ${error}`);
        sails.log.error(`${error}`);
      }
    }
    return _finish();
  },
};

module.exports = _exports;
