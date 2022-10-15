/**
 * Refund.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { v4: uuidv4 } = require("uuid");
module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    paymentIntentId: {
      type: "string",
      description: "The paymentIntentId of the ORIGINAL payment",
      required: true,
    },
    currency: {
      type: 'string',
      description: "The UPPERCASE asset or numeraire used in the trade to buy the order items from the seller",
      required: true,
    },
    amount: {
      type: "number",
      required: true,
    },
    requestedAt: {
      type: "number",
      description: "The unixtime when the refund was requested.",
      required: true,
    },
    refundStatus: {
      type: "string",
      defaultsTo: "unpaid",
      isIn: ["unpaid", "paid", "failed"],
    },
    recipientWalletAddress: {
      type: 'string',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    order: {
      model: "order",
      description:
        "the linked order if there was an order linked to this notification (nullable)",
    },
  },

  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.currency = valuesToSet.currency.toUpperCase();
    return proceed();
  },
};
