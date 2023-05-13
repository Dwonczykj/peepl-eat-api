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


export type GetPositionInWaitinglistInputs = {
  emailAddress: string,
  
};

export type GetPositionInWaitinglistResponse = {
  position: number,
} | false;

export type GetPositionInWaitinglistExits = {
  success: (unusedData: GetPositionInWaitinglistResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GetPositionInWaitinglistInputs,
  GetPositionInWaitinglistResponse,
  GetPositionInWaitinglistExits
> = {
  friendlyName: 'GetPositionInWaitinglist',

  inputs: {
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
    inputs: GetPositionInWaitinglistInputs,
    exits: GetPositionInWaitinglistExits
  ) {
    const email = inputs.emailAddress.trim().toLowerCase();
    const _entries = await WaitingList.find({
      email: email,
    });
    if(!_entries || _entries.length === 0){
      return exits.notFound();
    }
    const entry = _entries[0];

    const entriesAhead = await WaitingList.count({
      order: {'<': entry.order},
      onboarded: false,
    });


    return exits.success({
      position: entriesAhead + 1
    });
  },
};

module.exports = _exports;
