/**
 * OrderItem.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    unfulfilled: {
      type: "boolean",
      defaultsTo: false,
      description: "flag to show that item was unfulfilled from an order",
    },
    unfulfilledOnOrderId: {
      type: "number",
      required: false,
      allowNull: true,
      description:
        "Used to track the original order internal id of the parent order when an item is flagged as unfulfilled on an order, it is not removed from the order, it is just flagged as unfulfilled for tracking purposes. ",
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    order: {
      model: "order",
      description: "The order to which the item belongs",
      required: true,
    },
    product: {
      model: "product",
      description: "The product which has been ordered.",
      required: true,
    },
    optionValues: {
      collection: "orderitemoptionvalue",
      via: "orderItem",
    },
  },

  beforeCreate: async function (itemDraft, proceed) {
    // eslint-disable-next-line eqeqeq
    if(itemDraft.unfulfilled && itemDraft.unfulfilledOnOrderId == null){
      itemDraft.unfulfilled = false;
    }
    if(itemDraft.unfulfilled === false && itemDraft.unfulfilledOnOrderId > 0){
      itemDraft.unfulfilledOnOrderId = null;
    }
    proceed();
  },
};

