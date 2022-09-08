declare var Order: any;
declare var OrderItem: any;

module.exports = {

  friendlyName: 'Update items for order',

  description: 'This helper function will update / remove items for an order',

  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    retainItems: {
      type: 'ref',
      required: true,
      description: 'array of publicIds for the items'
    },
    removeItems: {
      type: 'ref',
      required: true,
      description: 'array of publicIds for the items'
    },
  },


  exits: {
    badPartialFulfilmentRequest: {
      statuscode: 401,
    },
    orderNotFound: {
      statuscode: 404,
      description: 'Order not found'
    },
    orderNotPaidFor: {
      statuscode: 401,
      description: 'the order has not been paid for.',
    },
    orderNotPending: {
      statuscode: 401,
      description: 'Restaurant has already accepted or rejected this order.',
    },
    complete: {
      statusCode: 200,
      data: null
    }
  },


  fn: async function (inputs, exits) {
    const order = await Order.findOne({publicId: inputs.orderId, completedFlag: ''});

    if (!inputs.retainItems || !inputs.removeItems ||
      !Array.isArray(inputs.retainItems) ||
      !Array.isArray(inputs.removeItems)
    ) {
      return exits.badPartialFulfilmentRequest();
    }

    const arraysEqual = function (a, b) {
      if (a === b) {
        return true;
      }
      if (a == null || b == null) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }

      var ac = a.map(x => x).sort();
      var bc = b.map(x => x).sort();

      for (var i = 0; i < ac.length; ++i) {
        if (ac[i] !== bc[i]) {
          return false;
        }
      }
      return true;
    };

    const orderIds = order.items.map(item => item.id);
    const partialFulfilCheckItems = inputs.retainItems + inputs.removeItems;

    if (!arraysEqual(orderIds, partialFulfilCheckItems)) {
      return exits.complete({data: {validRequest: false}});
    }

    await Order.updateOne({ publicId: inputs.orderId, completedFlag: '' })
      .set({
        restaurantAcceptanceStatus: 'partially fulfilled',
      });

    // Remove items from order that were not fulfilled by vendor
    await OrderItem
      .update({ order: order.id })
      .set({ order: null, unfulfilled: true, unfulfilledOnOrderId: order.id })
      .fetch();

    // Recalculate the order total
    var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({ orderId: order.id });

    // Update with correct amount
    await Order.updateOne(order.id)
      .set({ total: calculatedOrderTotal.finalAmount });

    return exits.complete({data: {validRequest: true, calculatedOrderTotal: calculatedOrderTotal.finalAmount}});

  }

};
