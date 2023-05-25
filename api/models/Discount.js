/**
 * Discount.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    code: {
      type: 'string',
      minLength: 3,
      maxLength: 36,
      unique: true,
      required: true,
    },
    value: {
      type: 'number',
      min: 0,
      required: true,
      description: 'The amount to discount; between 0 and 100 if percentage.',
    },
    currency: {
      type: 'string',
      required: true,
    },
    discountType: {
      type: 'string',
      isIn: ['percentage', 'fixed'],
      defaultsTo: 'fixed',
    },
    expiryDateTime: {
      type: 'ref',
      // columnType: 'datetime',
      columnType: 'date',
    },
    timesUsed: {
      type: 'number',
      defaultsTo: 0,
    },
    maxUses: {
      type: 'number',
    },
    isEnabled: {
      type: 'boolean',
      defaultsTo: false,
    },
    linkedWalletAddress: {
      type: 'string',
      required: false,
      regex: /^0x[a-fA-F0-9]{40}$|^$/,
      defaultsTo: '',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
      description: 'Optional vendor for this discount',
    },
    orders: {
      collection: 'order',
      via: 'discounts',
      description: 'all orders that the discount has been applied to',
    }
  },

  beforeCreate: function (valuesToSet, proceed) {
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
    return proceed();
  },
};
