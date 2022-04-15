declare var Order: any;
declare var FulfilmentMethod: any;
declare var Discount: any;

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
    .populate('items.product&optionValues&optionValues.option&optionValue&discount');

    var workingTotal = 0;

    // Add together product totals w/ options
    for(var item in order.items) {
      var productTotal = order.items[item].product.basePrice;

      for(var optionValue in order.items[item].optionValues) {
        productTotal += order.items[item].optionValues[optionValue].optionValue.priceModifier;
      }

      workingTotal += productTotal;
    }

    // Apply discount
    if(order.discount) {
      var discount = await Discount.findOne(order.discount);

      if(discount && discount.percentage) {
        var multiplier = discount.percentage / 100;
        var discountAmount = Math.trunc(workingTotal * multiplier);
        workingTotal = workingTotal - discountAmount;
      }
    }

    // Add delivery cost
    var fulfilmentMethod = await FulfilmentMethod.findOne(order.fulfilmentMethod);
    workingTotal += fulfilmentMethod.priceModifier;

    // Add tip amount
    workingTotal = workingTotal + order.tipAmount;

    return workingTotal;
  }

};
