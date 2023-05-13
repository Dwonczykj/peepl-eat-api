import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { SailsActionDefnType } from '../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  WaitingListEntryType
} from '../../scripts/utils';

declare var sails: sailsVegi;
declare var WaitingList: SailsModelType<WaitingListEntryType>;


export type WaitingListEntryTypeInputs = {};

export type WaitingListEntryTypeResult = sailsModelKVP<WaitingListEntryType>[] | false;

export type WaitingListEntryTypeExits = {
  success: (unusedData: WaitingListEntryTypeResult) => any;
};

const _exports: SailsActionDefnType<
  WaitingListEntryTypeInputs,
  WaitingListEntryTypeResult,
  WaitingListEntryTypeExits
> = {
  friendlyName: 'Build a queue ordered list from waitinglist in DB',
  inputs: {},

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: WaitingListEntryTypeInputs,
    exits: WaitingListEntryTypeExits
  ) {
    const queue = await WaitingList.find({
      onboarded: false,
    }).sort('order');

    return exits.success(queue);
  },
};

module.exports = _exports;
