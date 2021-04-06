declare var Order: any;
declare var _: any;

module.exports = {

  friendlyName: 'Calculate order total',

  description: 'This helper function will allow us to calculate the order total.',

  inputs: {
    orderId: {
      type: 'number',
      description: 'The ID of the order',
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
    .populate('items.product&deliveryMethod&deliverySlot&optionValues&optionValues.option&optionValue');

    var workingTotal = 0;

    var seenDeliveryMethods = [];
    for(var item in order.items) {
      var productTotal = order.items[item].product.basePrice;

      for(var optionValue in order.items[item].optionValues) {
        productTotal += order.items[item].optionValues[optionValue].optionValue.priceModifier;
      }

      if(!_.contains(seenDeliveryMethods, order.items[item].deliveryMethod.id)) { // If not seen this delivery method already.
        seenDeliveryMethods.push(order.items[item].deliveryMethod.id);
        workingTotal += order.items[item].deliveryMethod.priceModifier;
      }

      workingTotal += productTotal;
    }

    return workingTotal;
  }

};
