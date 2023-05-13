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
  DiscountType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Discount: SailsModelType<DiscountType>;


export type ValidateDiscountCodeInputs = {
  code: string,
  isGlobalPercentageCode: boolean;
  walletAddress?: string | null;
  vendor?: number | null;
};

export type ValidateDiscountCodeResponse = sailsModelKVP<DiscountType> | false;

export type ValidateDiscountCodeExits = {
  success: (unusedData: ValidateDiscountCodeResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ValidateDiscountCodeInputs,
  ValidateDiscountCodeResponse,
  ValidateDiscountCodeExits
> = {
  friendlyName: 'ValidateDiscountCode',

  inputs: {
    code: {
      type: 'string',
      required: true,
    },
    walletAddress: {
      type: 'string',
      required: false,
      defaultsTo: '',
      allowNull: true,
      // regex: /^0x[a-fA-F0-9]{40}$|^$/,
      description: 'required when checking fixed value codes',
    },
    isGlobalPercentageCode: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
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
    inputs: ValidateDiscountCodeInputs,
    exits: ValidateDiscountCodeExits
  ) {
    if(inputs.isGlobalPercentageCode){
      let percDiscounts = await Discount.find({
        code: inputs.code,
        discountType: 'percentage',
        isEnabled: true,
        vendor: inputs.vendor,
      });
      percDiscounts = percDiscounts.filter(
        (d) =>
          d.timesUsed <= d.maxUses &&
          moment.utc(d.expiryDateTime).isSameOrAfter(moment.utc())
      );
      if(percDiscounts && percDiscounts.length > 1){
        const warning = `${percDiscounts.length} percentage discount codes found for code: ${inputs.code}`;
        sails.log.warn(warning);
        await sails.helpers.sendEmailToSupport.with({
          message: warning,
          subject: 'vegi-server WARNING: Non-unique discount codes found in DB',
        });
      } else if (!percDiscounts || percDiscounts.length < 1){
        sails.log.info(`No discount codes found for code: ${inputs.code}`);
        return exits.success(false);
      } else {
        return exits.success(percDiscounts[0]);
      }
    }
    const walletAddressPattern = new RegExp(/^0x[a-fA-F0-9]{40}$/);
    if (
      !inputs.walletAddress
    ) {
      return exits.badRequest(
        'WalletAddress must be provided to validate fixed discount codes'
      );
    } else if (
      !inputs.walletAddress.match(walletAddressPattern)
    ) {
      return exits.badRequest(
        'WalletAddress must be a valid wallet address to validate fixed discount codes'
      );
    } else if (
      !inputs.vendor
    ) {
      return exits.badRequest(
        'Vendor must be provided to validate fixed discount codes'
      );
    }
    let fixedDiscounts = await Discount.find({
      code: inputs.code,
      linkedWalletAddress: inputs.walletAddress,
      vendor: inputs.vendor,
      discountType: 'fixed',
      isEnabled: true,
    });
    fixedDiscounts = fixedDiscounts.filter(
      (d) =>
        d.timesUsed <= d.maxUses &&
        moment.utc(d.expiryDateTime).isSameOrAfter(moment.utc())
    );
    if (fixedDiscounts && fixedDiscounts.length > 1) {
      const warning = `${fixedDiscounts.length} fixed discount codes found for code: ${inputs.code}`;
      sails.log.warn(warning);
      await sails.helpers.sendEmailToSupport.with({
        message: warning,
        subject: 'vegi-server WARNING: Non-unique discount codes found in DB',
      });
    } else if (!fixedDiscounts || fixedDiscounts.length < 1) {
      sails.log.info(`No discount codes found for code: ${inputs.code}`);
      return exits.success(false);
    } else {
      return exits.success(fixedDiscounts[0]);
    }
  },
};

module.exports = _exports;
