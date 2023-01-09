import { sailsModelKVP, SailsModelType } from "../../../api/interfaces/iSails";
import { UserType, walletAddressString } from "../../../scripts/utils";

declare var User: SailsModelType<UserType>;

type GetUserForWalletInput = {
  walletAddress:walletAddressString;
}

type GetUserForWalletOutput = {
  success: (unusedUser: sailsModelKVP<UserType> | {}) => void;
  badFormat: () => void;
};

module.exports = {


  friendlyName: 'Get user for wallet address',


  description: '',


  inputs: {
    walletAddress: {
      type: 'string',
      required: true
    }
  },


  exits: {
    success: {
      outputDescription: '`User`s vendor role status',
      outputExample: {
        isOwner: false,
        vendorID: 0,
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


  fn: async function (inputs: GetUserForWalletInput, exits: GetUserForWalletOutput) {
    const walletAddressPattern = new RegExp(/^0x[a-fA-F0-9]{40}$/);
    if(!inputs.walletAddress.match(walletAddressPattern)){
      return exits.badFormat();
    }
    
    const user = await User.findOne({
      walletAddress: inputs.walletAddress,
    });

    if (!user) {
      return exits.success({});
    }

    return exits.success(user);

  }


};
