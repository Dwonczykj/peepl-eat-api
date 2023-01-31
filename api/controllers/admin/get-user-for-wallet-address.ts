import { sailsModelKVP, SailsModelType } from "../../../api/interfaces/iSails";
import { AccountType, walletAddressString } from "../../../scripts/utils";

declare var Account: SailsModelType<AccountType>;

type GetAccountForWalletInput = {
  walletAddress:walletAddressString;
}

type GetAccountForWalletOutput = {
  success: (unusedUser: sailsModelKVP<AccountType> | {}) => void;
  badFormat: () => void;
};

module.exports = {


  friendlyName: 'Get account for wallet address',


  description: '',


  inputs: {
    walletAddress: {
      type: 'string',
      required: true
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
      return exits.success({});
    }

    return exits.success(account);

  }


};
