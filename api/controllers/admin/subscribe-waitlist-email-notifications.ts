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
  WaitingListEntryType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var WaitingList: SailsModelType<WaitingListEntryType>;


export type SubscribeWaitlistEmailNotificationsInputs = {
  emailAddress: string;
  receiveUpdates: boolean;
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
    }
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
    const entries = await WaitingList.find({
      email: inputs.emailAddress.toLowerCase(),
    });
    if(!entries || entries.length < 1){
      return exits.notFound();
    }
    await WaitingList.update({
      email: inputs.emailAddress.toLowerCase(),
    }).set({
      emailUpdates: true,
    });
    const updatedEntries = await WaitingList.find({
      email: inputs.emailAddress.toLowerCase(),
    });
    return exits.success(updatedEntries[0]);
  },
};

module.exports = _exports;
