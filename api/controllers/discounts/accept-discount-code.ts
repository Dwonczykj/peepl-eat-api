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
  AccountType,
  DiscountType,
  TransactionType,
  SailsDBError
} from '../../../scripts/utils';
import { generateCorrelationId, mintTokensToAddress } from '../../../fuse/fuseApi';
import { convertCurrency, Currency } from '../../interfaces';

declare var sails: sailsVegi;
declare var Account: SailsModelType<AccountType>;
declare var Discount: SailsModelType<DiscountType>;
declare var Transaction: SailsModelType<TransactionType>;


export type AcceptDiscountCodeInputs = {
  vegiAccountId: number,
  discountCode: string,
  vendorId: number | null | undefined,
};

export type AcceptDiscountCodeResponse = {
  codeAcceptanceStatus: 'accepted' | 'rejected' | 'already_accepted';
  discount: sailsModelKVP<DiscountType> | null,
};

export type AcceptDiscountCodeExits = {
  success: (unusedData: AcceptDiscountCodeResponse) => any;
  rejected: (unusedErr: Error | String) => void;
  notFound: (unusedErr: Error | String) => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  AcceptDiscountCodeInputs,
  AcceptDiscountCodeResponse,
  AcceptDiscountCodeExits
> = {
  friendlyName: 'AcceptDiscountCode',

  inputs: {
    discountCode: {
      type: 'string',
      required: true,
    },
    vegiAccountId: {
      type: 'number',
      required: true,
    },
    vendorId: {
      type: 'number',
      required: false,
    },
    
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    rejected: {
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
    inputs: AcceptDiscountCodeInputs,
    exits: AcceptDiscountCodeExits
  ) {
    let vegiAccount: sailsModelKVP<AccountType>;
    try {
      const _vegiAccounts = await Account.find({
        id: inputs.vegiAccountId,
      });
      if(!_vegiAccounts || _vegiAccounts.length < 1){
        return exits.notFound(`vegi account for id: [${inputs.vegiAccountId}] not found`);
      }
      vegiAccount = _vegiAccounts[0];
    } catch (_error) {
      const error: SailsDBError = _error;
      sails.log.error(error);
      return exits.notFound(
        `vegi account for id: [${inputs.vegiAccountId}] find error: ${error.details}`
      );
    }

    var discount = await sails.helpers.checkDiscountCode.with({
      discountCode: inputs.discountCode,
      vendorId: inputs.vendorId,
    });

    if(!discount) {
      return exits.success({
        codeAcceptanceStatus: 'rejected',
        discount: null,
      });
    }
    

    // TODO: Check for existing Transactions for this vegiAccount with this discount code
    let alreadyAcceptedVoucher = true;
    try {
      const _transForVoucher = await Transaction.find({
        vegiDiscount: discount.id,
        receiver: vegiAccount.id,
      });
      if(_transForVoucher && _transForVoucher.length > 0){
        alreadyAcceptedVoucher = true;
        return exits.success({
          codeAcceptanceStatus: 'already_accepted',
          discount: discount,
        });
      } else {
        alreadyAcceptedVoucher = false;
      }
    } catch (_error) {
      const error: SailsDBError = _error;
      sails.log.error(error);
      return exits.notFound(
        `accept-discount-code error locating transcations in vegi -> find error: ${error.details}`
      );
    }

    if(alreadyAcceptedVoucher){
      return exits.success({
        codeAcceptanceStatus: 'already_accepted',
        discount: discount,
      });
    }

    // const GBPDiscountValue = discount.currency === 'GBP' ? discount.value : discount.currency === 'GBT' ? convertCurrency(discount.value, Currency.GBT, Currency.GBP) : convertCurrency(discount.value, Currency[discount.currency], Currency.GBP);
    const GBTDiscountValue = await convertCurrency(discount.value, Currency[discount.currency], Currency.GBT);

    try {
      // void call:
      const correlationId = generateCorrelationId();
      const mintVoucherToAcceptee = await mintTokensToAddress({
        toAddress: vegiAccount.walletAddress,
        amount: GBTDiscountValue.toString(),
        correlationId: correlationId,
        discountId: discount.id,
        orderId: null,
      });
      if (!mintVoucherToAcceptee.error) {
        // return exits.success(mintVoucherToAcceptee);
      } else {
        sails.log.error(
          `Unable to mint ${discount.value} [${discount.currency}] Tokens to "${vegiAccount.walletAddress}" for accepting voucher: [${inputs.discountCode}] with error: ${mintVoucherToAcceptee.error}`
        );
        return exits.error(
          `Unable to mint ${discount.value} [${discount.currency}] Tokens to "${vegiAccount.walletAddress}" for accepting voucher: [${inputs.discountCode}] with error: ${mintVoucherToAcceptee.error}`
        );
      }
    } catch (error) {
      sails.log.error(
        `Unable to mint ${discount.value} [${discount.currency}] Tokens to "${vegiAccount.walletAddress}" for accepting voucher: [${inputs.discountCode}] with error: ${error}`
      );
      return exits.error(
        `Unable to mint ${discount.value} [${discount.currency}] Tokens to "${vegiAccount.walletAddress}" for accepting voucher: [${inputs.discountCode}] with error: ${error}`
      );
    }

    // All done.
    return exits.success({
      codeAcceptanceStatus: 'accepted',
      discount: discount,
    });
  },
};

module.exports = _exports;
