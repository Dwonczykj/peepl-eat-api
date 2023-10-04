import { sailsModelKVP, SailsModelType } from "../../../api/interfaces/iSails";
import { AccountType, UserRoleLiteral, UserType, walletAddressString } from "../../../scripts/utils";

declare var Account: SailsModelType<AccountType>;
declare var User: SailsModelType<UserType>;

type GetAccountForWalletInput = {
  walletAddress: walletAddressString;
  accountType: AccountType['accountType'];
};
type GetAccountForWalletResult = {
  account: sailsModelKVP<AccountType>;
};

type GetAccountForWalletOutput = {
  success: (unusedUser: GetAccountForWalletResult) => void;
  badFormat: () => void;
};

module.exports = {


  friendlyName: 'Get account for wallet address',


  description: '',


  inputs: {
    walletAddress: {
      type: 'string',
      required: true
    },
    accountType: {
      type: 'string',
      required: false,
    }
  },


  exits: {
    success: {
      
      outputExample: {
        walletAddress: '0x13948y143adfaerf9r5',
        verified: false,
      }
    },
    unauthorised: {
      description: 'You are not authenticated',
      responseType: 'unauthorised'
    },
    notFound: {
      responseType: 'notFound'
    },
    badCombo: {
      responseType: 'unauthorised',
    },
    badFormat: {
      statusCode: 400,
    },
  },


  fn: async function (inputs: GetAccountForWalletInput, exits: GetAccountForWalletOutput) {
    const walletAddressPattern = new RegExp(/^0x[a-fA-F0-9]{40}$/);
    if(!inputs.walletAddress.match(walletAddressPattern)){
      return exits.badFormat();
    }

    const account = await Account.findOne({
      walletAddress: inputs.walletAddress,
    });

    if (!account) {
      const newAccount = await Account.create({
        walletAddress: inputs.walletAddress,
        verified: false,
        accountType:
          (inputs.accountType &&
            ['ethereum', 'fuse', 'fuse_spark', 'bank'].includes(
              inputs.accountType
            ) &&
            inputs.accountType) ||
          'fuse',
      }).fetch();
      return exits.success({account: newAccount});
    }

    return exits.success({ account: account });

  }


};
