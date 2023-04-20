import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { DiscountType, SailsActionDefnType } from '../../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  UserType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;
declare var Discount: SailsModelType<DiscountType>;


export type EditDiscountInputs = Partial<DiscountType>;

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
    discountType: {
      type: 'string',
      isIn: ['percentage', 'fixed'],
    },
    linkedWalletAddress: {
      type: 'string',
      regex: /^0x[a-fA-F0-9]{40}$|^$/,
    },
    value: {
      type: 'number',
      min: 0,
      max: 100,
    },
    expiryDateTime: {
      type: 'number',
    },
    maxUses: {
      type: 'number',
    },
    isEnabled: {
      type: 'boolean',
    },
  },

  exits: {
    success: {
      data: false,
    },
    error: {
      statusCode: 403,
    }
  },

  fn: async function (inputs: EditDiscountInputs, exits: EditDiscountExits) {
    let user = await User.findOne(this.req.session.userId);
    let discount = await Discount.findOne(inputs.id);

    if (!user.isSuperAdmin) {
      if (discount.vendor !== user.vendor) {
        return exits.error('You do not have permission to edit this discount');
      }
    }

    inputs.code = inputs.code.toUpperCase();
    const valuesToSet = inputs;
    if(valuesToSet.discountType === 'percentage'){
      valuesToSet.value = Math.max(Math.min(100,valuesToSet.value),0);
    }else if(valuesToSet.discountType === 'fixed'){
      if(valuesToSet.maxUses !== 1){
        sails.log.warn(`When creating a discount voucher, the maxUses must be set to "1" not "${valuesToSet.maxUses}"`);
      }
      if(valuesToSet.value === 0){
        sails.log.warn(`When creating a discount voucher, the amount should be > 0.`);
      }
      valuesToSet.maxUses = 1;
    }

    var updatedDiscount = await Discount.updateOne(inputs.id).set(valuesToSet);

    // All done.
    return exits.success({
      id: updatedDiscount.id,
    });
  },
};

module.exports = _exports;