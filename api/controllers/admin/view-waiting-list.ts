import { sailsModelKVP, SailsModelType } from '../../interfaces/iSails';
import { AccountType, SailsActionDefnType, WaitingListEntryType } from "../../../scripts/utils";

declare var WaitingList: SailsModelType<WaitingListEntryType>;

export type GetWaitingListInputs = {};

export type GetWaitingListResult = {
  waitingListEntries: sailsModelKVP<WaitingListEntryType>[];
};

export type GetWaitingListExits = {
  success: (unusedData: GetWaitingListResult) => any;
  successJSON: (unusedData: GetWaitingListResult) => any;
  notFound: (unusedErr?: Error | string) => any;
};

const _exports: SailsActionDefnType<
  GetWaitingListInputs,
  GetWaitingListResult,
  GetWaitingListExits
> = {
  friendlyName: 'View waiting list',

  description:
    'Display waiting listed email addresses management page.',

  inputs: {},

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/waiting-list',
    },
    successJSON: {
      statusCode: 200,
    },
    notFound: {
      statusCode: 404,
    }
  },

  fn: async function (inputs, exits) {
    const emailAddresses = await WaitingList.find();

    const sortedEmails = emailAddresses.sort((a, b) => {
      return (
        (a.userType && b.userType && a.userType.localeCompare(b.userType)) ||
        a.email.localeCompare(b.email)
      );
    });

    const result = { waitingListEntries: sortedEmails };

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(result);
    } else {
      return exits.success(result);
    }
  },
};

module.exports = _exports;
