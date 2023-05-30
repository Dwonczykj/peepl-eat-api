import moment from 'moment';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  SailsActionDefnType,
  DiscountType
} from '../../scripts/utils';

declare var sails: sailsVegi;
declare var Discount: SailsModelType<DiscountType>;


export type CheckDiscountCodeInputs = {
  discountCode: string;
  vendorId?: number | undefined;
};

export type CheckDiscountCodeResponse = sailsModelKVP<DiscountType> | false;

export type CheckDiscountCodeExits = {
  success: (unusedData: CheckDiscountCodeResponse) => any;
};

const _exports: SailsActionDefnType<
  CheckDiscountCodeInputs,
  CheckDiscountCodeResponse,
  CheckDiscountCodeExits
> = {
  friendlyName: 'CheckDiscountCode',

  inputs: {
    discountCode: {
      type: 'string',
      required: true,
    },
    vendorId: {
      type: 'number',
    },
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: CheckDiscountCodeInputs,
    exits: CheckDiscountCodeExits
  ) {
    const discountCode = inputs.discountCode.toUpperCase();
    let discounts: sailsModelKVP<DiscountType>[];
    if (inputs.vendorId) {
      discounts = await Discount.find({
        code: discountCode,
        vendor: inputs.vendorId,
      });
    } else {
      discounts = await Discount.find({ code: discountCode });
    }
    var currentTime = new Date().getTime();
    discounts = discounts.filter(
      (d) =>
        d.timesUsed < d.maxUses &&
        moment.utc(d.expiryDateTime).isSameOrAfter(moment.utc()) &&
        d.isEnabled
    );

    if (!discounts || discounts.length < 0) {
      return exits.success(false);
    }

    const discount = discounts[0];

    // if (discount.vendor && discount.vendor !== inputs.vendorId) {
    //   return exits.success(false);
    // }

    // if (discount.maxUses && discount.timesUsed >= discount.maxUses) {
    //   return exits.success(false);
    // }

    // if (!discount.isEnabled) {
    //   return exits.success(false);
    // }

    // All done.
    return exits.success(discount);
  },
};

module.exports = _exports;
