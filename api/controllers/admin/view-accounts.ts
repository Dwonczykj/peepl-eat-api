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


export type ViewAccountsInputs = {};

export type ViewAccountsResponse = {
  Accounts: sailsModelKVP<AccountType>[];
  userRole: number;
};

export type ViewAccountsExits = {
  success: (unusedData: ViewAccountsResponse) => any;
  successJSON: (
    unusedResponse: ViewAccountsResponse
  ) => ViewAccountsResponse;
  notFound: () => void;
  issue: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ViewAccountsInputs,
  ViewAccountsResponse,
  ViewAccountsExits
> = {
  friendlyName: 'ViewAccounts',

  inputs: {},

  exits: {
    success: {
      data: false,
      viewTemplatePath: 'pages/admin/view-accounts',
    },
    successJSON: {
      statusCode: 200,
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
    inputs: ViewAccountsInputs,
    exits: ViewAccountsExits
  ) {
    var AccountsUnsorted = await Account.find();

    const Accounts = AccountsUnsorted;

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({
        Accounts: Accounts,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        Accounts: Accounts,
        userRole: this.req.session.userRole,
      });
    }
  },
};

module.exports = _exports;
