import { AccountType, VendorType, SailsActionDefnType, walletAddressString } from '../../../scripts/utils';
import { sailsModelKVP, SailsModelType } from '../../interfaces/iSails';

declare var Account: SailsModelType<AccountType>;
declare var Vendor: SailsModelType<VendorType>;

type AccountIsVendorInput = {
  walletAddress: walletAddressString | "";
};
type AccountIsVendorResponse =
  | {
      isVendor: true;
      vendorId: number;
    }
  | {
      isVendor: false;
      vendorId: null;
    };
type AccountIsVendorExits = {
  success: (
    unusedArg: AccountIsVendorResponse
  ) => AccountIsVendorResponse;
};

const _exports: SailsActionDefnType<
  AccountIsVendorInput,
  AccountIsVendorResponse,
  AccountIsVendorExits
> = {
  friendlyName: 'Account is vendor',

  description: 'Check if a wallet address belongs to a vendor',

  inputs: {
    walletAddress: {
      type: "string",
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
  },

  exits: {
    success: {
      
    },
  },

  fn: async function (inputs, exits) {
    var accounts = await Account.find({
      walletAddress: inputs.walletAddress
    });

    if (!accounts || accounts.length < 1){
      return exits.success({
        isVendor: false,
        vendorId: null,
      });
    }

    const vendors = await Vendor.find({
      walletAddress: inputs.walletAddress
    });

    if(vendors && vendors.length > 0){
      return exits.success({
        isVendor: true,
        vendorId: vendors[0].id,
      });
    } else {
      return exits.success({
        isVendor: false,
        vendorId: null,
      });
    }
    
  },
};

module.exports = _exports;
