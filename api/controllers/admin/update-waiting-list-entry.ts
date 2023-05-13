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


export type UpdateWaitingListEntryInputs = {
  id: number,
  emailAddress: string,
};

export type UpdateWaitingListEntryResponse = sailsModelKVP<WaitingListEntryType> | false;

export type UpdateWaitingListEntryExits = {
  success: (unusedData: UpdateWaitingListEntryResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  UpdateWaitingListEntryInputs,
  UpdateWaitingListEntryResponse,
  UpdateWaitingListEntryExits
> = {
  friendlyName: 'UpdateWaitingListEntry',

  inputs: {
    id: {
      type: 'number',
      required: true,
    },
    emailAddress: {
      type: 'string',
      required: true,
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
    inputs: UpdateWaitingListEntryInputs,
    exits: UpdateWaitingListEntryExits
  ) {
    const _existingWaitingListEntries = await WaitingList.find({
      id: inputs.id,
    });
    if (!_existingWaitingListEntries || _existingWaitingListEntries.length === 0) {
      return exits.notFound();
    }
    const email = inputs.emailAddress.trim().toLowerCase();
    if (_existingWaitingListEntries[0].email === email){
      return exits.success(_existingWaitingListEntries[0]);
    }
    await WaitingList.update({
      id: inputs.id,
    }).set({
      email: email,
    });
    const updatedEntry = await WaitingList.findOne(inputs.id);
    return exits.success(updatedEntry);
  },
};

module.exports = _exports;
