import { sailsModelKVP, SailsModelType } from '../../interfaces/iSails';
import { AccountType, SailsActionDefnType } from "../../../scripts/utils";

declare var Account: SailsModelType<AccountType>;

export type GetWhiteListInputs = {};

export type GetWhiteListResult = {
  accounts: sailsModelKVP<AccountType>[];
};

export type GetWhiteListExits = {
  success: (unusedData: GetWhiteListResult) => any;
  successJSON: (unusedData: GetWhiteListResult) => any;
  notFound: (unusedErr?: Error | string) => any;
};

const _exports: SailsActionDefnType<
  GetWhiteListInputs,
  GetWhiteListResult,
  GetWhiteListExits
> = {
  friendlyName: 'View white list',

  description:
    'Display white listed wallet addressed accounts management page.',

  inputs: {},

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/white-list',
    },
    successJSON: {
      statusCode: 200,
    },
    notFound: {
      statusCode: 404,
    }
  },

  fn: async function (inputs, exits) {
    const listedAccounts = await Account.find();

    const sortedListedAccounts = listedAccounts.sort((a, b) => {
      const statae: boolean[] = [false, true];
      return (
        statae.indexOf(a.verified) - statae.indexOf(b.verified) ||
        a.walletAddress.localeCompare(b.walletAddress)
      );
    });

    const result = { accounts: sortedListedAccounts };

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(result);
    } else {
      return exits.success(result);
    }
  },
};

module.exports = _exports;
