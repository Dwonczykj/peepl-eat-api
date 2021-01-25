module.exports = {

  friendlyName: 'Calculate order total',

  description: 'This helper function will allow us to calculate the order total.',

  inputs: {
    orderId: {
      type: 'number',
      description: "The ID of the order",
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.',
    },

  },

  fn: async function (inputs) {
    var order = await Order.findOne(inputs.orderId)
    .populate("items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue");

    console.log(order);
  }


};

