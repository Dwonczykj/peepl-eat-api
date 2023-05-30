import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { DiscountType, SailsActionDefnType } from '../../../scripts/utils';
import {
  SailsModelType,
  sailsModelKVP,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  UserType
} from '../../../scripts/utils';
import { Currency } from '../../../api/interfaces/peeplPay/currency';

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;
declare var Discount: SailsModelType<DiscountType>;


export type EditDiscountInputs = Partial<sailsModelKVP<DiscountType>>;

export type EditDiscountResult = {id:number} | false;

export type EditDiscountExits = {
  success: (unusedData: EditDiscountResult) => any;
  error: (unusedMessage?: Error|string|undefined) => void;
};

const _exports: SailsActionDefnType<
  EditDiscountInputs,
  EditDiscountResult,
  EditDiscountExits
> = {
  friendlyName: 'EditDiscount',

  inputs: {
    id: {
      type: 'number',
      required: true,
    },
    code: {
      type: 'string',
    },
    value: {
      type: 'number',
      min: 0,
      max: 100,
    },
    currency: {
      type: 'string',
      required: false,
      defaultsTo: Currency.GBPx,
    },
    discountType: {
      type: 'string',
      isIn: ['percentage', 'fixed'],
    },
    expiryDateTime: {
      type: 'ref',
    },
    maxUses: {
      type: 'number',
    },
    isEnabled: {
      type: 'boolean',
    },
    linkedWalletAddress: {
      type: 'string',
      regex: /^0x[a-fA-F0-9]{40}$|^$/,
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
    error: {
      statusCode: 400,
    },
  },

  fn: async function (inputs: EditDiscountInputs, exits: EditDiscountExits) {
    let user = await User.findOne(this.req.session.userId);
    let discount = await Discount.findOne(inputs.id);

    if (!user.isSuperAdmin) {
      if (discount.vendor !== user.vendor) {
        return exits.error('You do not have permission to edit this discount');
      }
    }

    if (typeof inputs.value !== 'number') {
      sails.log(
        `Request contained a discount code value of "${
          inputs.value
        }" with type: ${typeof inputs.value}`
      );
      return exits.error(
        `Request contained a discount code value of "${
          inputs.value
        }" with type: ${typeof inputs.value}`
      );
    }

    inputs.code = inputs.code.toUpperCase();
    const {id, ...valuesToSet} = inputs;
    
    if (valuesToSet.discountType === 'percentage') {
      valuesToSet.value = Math.max(Math.min(100, valuesToSet.value), 0);
    } else if (valuesToSet.discountType === 'fixed') {
      if (valuesToSet.maxUses !== 1) {
        sails.log.warn(
          `When creating a discount voucher, the maxUses must be set to "1" not "${valuesToSet.maxUses}"`
        );
      }
      if (valuesToSet.value === 0) {
        sails.log.warn(
          `When creating a discount voucher, the amount should be > 0.`
        );
      }
      valuesToSet.maxUses = 1;
    }

    try {
      var updatedDiscount = await Discount.updateOne(inputs.id).set(valuesToSet);
  
      // All done.
      return exits.success({
        id: updatedDiscount.id,
      });
    } catch (error) {
      return exits.error(error);
    }
  },
};

module.exports = _exports;