module.exports = {
  friendlyName: "Get order status",

  description: "",

  inputs: {
    orderId: {
      type: "number",
      description: "ID of the order",
    },
  },

  exits: {
    notFound: {
      responseType: "notFound",
    },
  },

  fn: async function (inputs) {
    var order = await Order.findOne(inputs.orderId);

    if (!order) {
      throw "notFound";
    }

    return {
      paymentStatus: order.paymentStatus,
      restaurantAcceptanceStatus: order.restaurantAcceptanceStatus,
    };
  },
};
