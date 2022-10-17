declare var Order: any;
module.exports = {
  friendlyName: "View deliveries",

  description: 'Display "DeliveryPartner Deliveries" page.',

  inputs: {
    deliveryPartnerId: {
      type: "number",
      required: true,
    },
  },

  exits: {
    success: {
      viewTemplatePath: "pages/couriers/deliveries",
    },
    successJSON: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    var orders = await Order.find({
      or: [
        { deliveryPartner: inputs.deliveryPartnerId },
        { deliveryPartner: null, fulfilmentMethod: 1 },
      ],
      completedFlag: "",
    }).populate(
      "deliveryId&deliveryPartner&vendor&fulfilmentSlotFrom&fulfilmentSlotTo&deliveryAddressLineOne&deliveryAddressLineTwo&deliveryAddressCity&deliveryAddressPostCode"
    ); // https://sailsjs.com/documentation/concepts/models-and-orm/associations#?associations-in-retrieved-records
    
    const yourOrders = orders.filter(
      (order) => order.deliveryPartner && order.deliveryPartner.id === inputs.deliveryPartnerId
    );
    
    const otherOrders = orders.filter((order) => order.deliveryPartner === null);
    
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ yourOrders, otherOrders });
    } else {
      return exits.success({ yourOrders, otherOrders });
    }
  },
};
