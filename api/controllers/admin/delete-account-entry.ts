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
  AccountType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;


export type DeleteAccountEntryInputs = {
  walletAddress: string,
};

export type DeleteAccountEntryResponse = boolean;

export type DeleteAccountEntryExits = {
  success: (unusedData: DeleteAccountEntryResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  DeleteAccountEntryInputs,
  DeleteAccountEntryResponse,
  DeleteAccountEntryExits
> = {
  friendlyName: 'DeleteAccountEntry',

  inputs: {
    walletAddress: {
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
    inputs: DeleteAccountEntryInputs,
    exits: DeleteAccountEntryExits
  ) {
    if(!inputs.walletAddress){
      return exits.badRequest(Error('No wallet address provided.'));
    }
    let deletedAccountIds = [];
    try {
      const accountEntries = await Account.find({
        walletAddress: inputs.walletAddress,
      });
      deletedAccountIds = accountEntries.map((a) => a.id);
      if(!accountEntries || accountEntries.length < 1){
        return exits.notFound();
      }
    } catch (error) {
      sails.log.error(`Unable to fetch accounts to delete for walletAddress: "${inputs.walletAddress}" with error: ${error}`);
    }

    try {
      await Account.destroy({
        walletAddress: inputs.walletAddress,
      });
      // if (deletedAccountEntries && deletedAccountEntries.length) {
      //   deletedAccountIds = deletedAccountEntries.map((a) => a.id);
      // }
    } catch (error) {
      sails.log.error(`Unable to destroy and fetch accounts for deletion for walletAddress: "${inputs.walletAddress}" with error: ${error}`);
    }

    let shouldBeEmpty = [];
    try {
      const accountEntries = await Account.find({
        walletAddress: inputs.walletAddress,
      });
      shouldBeEmpty = accountEntries.map((a) => a.id);
    } catch (error) {
      sails.log.error(
        `Unable to fetch accounts that should have been deleted for walletAddress: "${inputs.walletAddress}" with error: ${error}`
      );
      await sails.helpers.sendEmailToSupport.with({
        subject: 'Unable to delete accounts [Check Logs]',
        message: `Check the logs at the timestamp of this email with search string: "Unable to delete accounts for walletaddress: "`,
      });
      return exits.success(false);
    }

    if(shouldBeEmpty && shouldBeEmpty.length > 0){
      sails.log.error(`Unable to delete accounts for walletaddress: ${inputs.walletAddress}`);
      await sails.helpers.sendEmailToSupport.with({
        subject: 'Unable to delete accounts [Check Logs]',
        message: `Check the logs at the timestamp of this email with search string: "Unable to delete accounts for walletaddress: "`,
      });
      return exits.success(false);
    }


    return exits.success(true);
  },
};

module.exports = _exports;
