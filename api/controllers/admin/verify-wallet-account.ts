import { UserRecord } from 'firebase-admin/auth';
import * as firebase from '../../../config/firebaseAdmin';
import {
  AccountType,
  SailsActionDefnType,
} from '../../../scripts/utils';
import { sailsVegi, SailsModelType } from '../../interfaces/iSails';
declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;

type VerifyWalletAccountInputs = {
  walletAddress: AccountType['walletAddress'];
  verified: AccountType['verified'];
};

type VerifyWalletAccountResult = { updatedAccountId: number };
type VerifyWalletAccountExits = {
  success: (unusedArg: VerifyWalletAccountResult) => any;
  badRequest: (unusedArg?: any) => void;
  notFound: () => void;
  unauthorised: () => void;
};

const _exports: SailsActionDefnType<
  VerifyWalletAccountInputs,
  VerifyWalletAccountResult,
  VerifyWalletAccountExits
> = {
  friendlyName: 'Update User Vendor Role',

  description:
    'Update the role of the user at the vendor they are registered to',

  inputs: {
    walletAddress: {
      type: 'string',
      required: false,
      regex: /^0x[a-fA-F0-9]{40}$|^$/,
      defaultsTo: '',
    },
    verified: {
      type: 'boolean',
      required: true,
    },
  },

  exits: {
    success: {
      
    },
    badRequest: {
      description: 'Bad wallet addressed',
      message: 'Bad wallet addressed',
      responseType: 'badRequest',
    },
    notFound: {
      description: 'There is no account with that wallet address',
      message: 'There is no account with that wallet address',
      responseType: 'notFound',
    },
    unauthorised: {
      responseType: 'unauthorised',
    },
  },

  fn: async function (inputs, exits) {
    const walletAddressPattern = new RegExp(/^0x[a-fA-F0-9]{40}$/);
    if (!inputs.walletAddress.match(walletAddressPattern)) {
      return exits.badRequest(); 
    }

    const existingAccount = await Account.findOne({
      walletAddress: inputs.walletAddress,
    });
    let result: VerifyWalletAccountResult = {
      updatedAccountId: null,
    };
    if (!existingAccount) {
      const newAccount = await Account.create({
        verified: inputs.verified,
        walletAddress: inputs.walletAddress,
      }).fetch();
      result = {
        updatedAccountId: newAccount.id,
      };
    } else {
      result = {
        updatedAccountId: existingAccount.id,
      };
    }

    // All done.
    return exits.success(result);
  },
};

module.exports = _exports;
