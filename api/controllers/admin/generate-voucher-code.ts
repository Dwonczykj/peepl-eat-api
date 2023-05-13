import moment from 'moment';
import { nanoid } from 'nanoid';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  DiscountType
} from '../../../scripts/utils';
import { Currency } from '../../../api/interfaces/peeplPay';

declare var sails: sailsVegi;
declare var Discount: SailsModelType<DiscountType>;


export type GenerateVoucherCodeInputs = {
  value: number,
  walletAddress: string,
  expiresInNMonths: number,
  vendor?: number;
};

export type GenerateVoucherCodeResponse = DiscountType | false;

export type GenerateVoucherCodeExits = {
  success: (unusedData: GenerateVoucherCodeResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GenerateVoucherCodeInputs,
  GenerateVoucherCodeResponse,
  GenerateVoucherCodeExits
> = {
  friendlyName: 'GenerateVoucherCode',

  inputs: {
    value: {
      type: 'number',
      required: true,
    },
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
    expiresInNMonths: {
      type: 'number',
      required: false,
      defaultsTo: 6,
      min: 0.03,
      allowNull: true,
    },
    vendor: {
      type: 'number',
      required: false,
      allowNull: true,
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
    inputs: GenerateVoucherCodeInputs,
    exits: GenerateVoucherCodeExits
  ) {
    try {
      // 11 characters
      // ~139 years needed, in order to have a 1% probability of at least one collision.
      // ~ https://stackoverflow.com/a/41196848
      let voucherCode = nanoid(12); //=> "bdkjNOkq9PO"
      const checkVoucherCodeIsUnique = async (code:string) => {
        const results = await Discount.find({
          code: code,
        });
        return !(results && results.length > 0); 
      }
      let isUnique = await checkVoucherCodeIsUnique(voucherCode);
      if(!isUnique){
        voucherCode = nanoid(12);
      }
      voucherCode = voucherCode.toUpperCase();
      const n = inputs.expiresInNMonths && Math.max(0.03, inputs.expiresInNMonths);
      const maxVoucherValue = 100;
      if(inputs.value > maxVoucherValue){
        sails.log.error(`Cant add voucher with value greater than ${maxVoucherValue}; input voucher value of ${inputs.value}`);
      }
      const x = Math.min(Math.max(0.01, inputs.value),maxVoucherValue);
      const newVoucher = await Discount.create({
        code: voucherCode,
        expiryDateTime: inputs.expiresInNMonths && moment.utc().add(n, 'months').format('YYYY-MM-DD'),
        linkedWalletAddress: inputs.walletAddress,
        value: inputs.value,
        vendor: x,
        currency: Currency.GBP,
        discountType: "fixed",
        isEnabled: true,
        maxUses: 1,
        timesUsed: 0,
      }).fetch();
      return exits.success(newVoucher);
    } catch (error) {
      sails.log.error(`Unable to generate one-time voucher code: ${error}`);
      return exits.success(false);
    }

  },
};

module.exports = _exports;
