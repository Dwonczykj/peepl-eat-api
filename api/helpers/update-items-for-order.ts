declare var Order: any;
declare var OrderItem: any;
declare var Cloud: any;

module.exports = {

  friendlyName: 'Update items for order',

  description: 'This helper function will update / remove items for an order',

  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    customerWalletAddress: {
      type: 'string',
      required: true
    },
    retainItems: {
      type: 'ref',
      required: true,
      description: 'array of internal ids for the items'
    },
    removeItems: {
      type: 'ref',
      required: true,
      description: 'array of internal ids for the items'
    },
  },


  exits: {
    badPartialFulfilmentRequest: {
    },
    orderNotFound: {
      description: 'Order not found'
    },
    orderNotPaidFor: {
      description: 'the order has not been paid for.',
    },
    orderNotPending: {
      description: 'Restaurant has already accepted or rejected this order.',
    },
    complete: {
      data: null
    }
  },


  fn: async function (inputs, exits) {
    const findOrderCriteria = {
      publicId: inputs.orderId,
      paymentStatus: 'paid',
      customerWalletAddress: inputs.customerWalletAddress,
      completedFlag: ''
    };
    const originalOrder = await Order.findOne(findOrderCriteria);

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
      // eslint-disable-next-line eqeqeq
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

    const orderIds = originalOrder.items.map(item => item.id);
    const partialFulfilCheckItems = inputs.retainItems + inputs.removeItems;

    if (!arraysEqual(orderIds, partialFulfilCheckItems)) {
      return exits.complete({data: {validRequest: false}});
    }

    // Create the copy of the order object now before removing items on th new order
    await sails.getDatastore()
    .transaction(async (db: any)=> {
      // TODO: Error handling here.
      const newOrder = await Order.create({
        total: 0.0, // * Set later!
        orderedDateTime: originalOrder.orderedDateTime,
        paidDateTime: originalOrder.paidDateTime,
        paymentStatus: originalOrder.paymentStatus,
        paymentIntentId: originalOrder.paymentIntentId,
        deliveryName: originalOrder.deliveryName,
        deliveryEmail: originalOrder.deliveryEmail,
        deliveryPhoneNumber: originalOrder.deliveryPhoneNumber,
        deliveryAddressLineOne: originalOrder.deliveryAddressLineOne,
        deliveryAddressLineTwo: originalOrder.deliveryAddressLineTwo,
        deliveryAddressCity: originalOrder.deliveryAddressCity,
        deliveryAddressPostCode: originalOrder.deliveryAddressPostCode,
        deliveryAddressInstructions: originalOrder.address.deliveryInstructions,
        customerWalletAddress: originalOrder.walletAddress,
        discount: originalOrder.discount.id,
        vendor: originalOrder.vendor.id,
        fulfilmentMethod: originalOrder.fulfilmentMethod,
        fulfilmentSlotFrom: originalOrder.fulfilmentSlotFrom,
        fulfilmentSlotTo: originalOrder.fulfilmentSlotTo,
        tipAmount: originalOrder.tipAmount
      })
      .fetch();

      // Strip unneccesary data from order items
      //TODO Is this necessary?
      const retainedItems = originalOrder.items.filter(item => inputs.retainItems.included(item.id));
      var updatedItems = _.map(retainedItems, (object) => {
        object.order = newOrder.id;
        object.product = object.id;

        return _.pick(object, ['order', 'product', 'optionValues']);
      });

      // Create each order item
      await OrderItem.createEach(updatedItems)
        .usingConnection(db);

      // Calculate the order total on the backend
      var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({orderId: newOrder.id});

      // Update with correct amount
      await Order.updateOne(newOrder.id)
        .set({ total: calculatedOrderTotal.finalAmount })
        .usingConnection(db);

      // Return error if vendor minimum order value not met
      if(calculatedOrderTotal.withoutFees < originalOrder.vendor.minimumOrderAmount) {
        return exits.minimumOrderAmount('Vendor minimum order value not met on partially fulfilled updated order');
      }

      await Order.updateOne(findOrderCriteria)
      .set({
        restaurantAcceptanceStatus: 'partially fulfilled',
        completedFlag: 'void',
      })
      .usingConnection(db);

      // Remove items from order that were not fulfilled by vendor
      await OrderItem
        .update({ order: newOrder.id, id: [...inputs.removeItems] })
        .set({ unfulfilled: true, unfulfilledOnOrderId: originalOrder.id })
        .usingConnection(db)
        .fetch();

      return exits.complete({data: {
        validRequest: true, 
        calculatedOrderTotal: calculatedOrderTotal.finalAmount,
        orderID: newOrder.id,
        paymentIntentID: newOrder.paymentIntentId
      }});
    });
  }

};
