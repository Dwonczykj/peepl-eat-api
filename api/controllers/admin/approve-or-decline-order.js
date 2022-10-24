module.exports = {


  friendlyName: 'Approve or decline order',


  description: '',


  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    restaurantAccepted: {
      type: 'boolean',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var order = await Order.findOne({
      publicId: inputs.orderId,
      fulfilmentSlotFrom: {
        '>=': new Date()
      }
    });

    if (!order) {
      throw new Error('Order not found.');
    }

    if(order.restaurantAcceptanceStatus !== 'pending') {
      // Restaurant has previously accepted or declined the order, they cannot modify the order acceptance after this.
      throw new Error('Restaurant has already accepted or rejected this order.');
    }

    if(order.paymentStatus !== 'paid') {
      // Order is not paid
      throw new Error('the order has not been paid for.');
    }

    if(inputs.restaurantAccepted === true) {
      await Order.updateOne({publicId: inputs.orderId})
      .set({restaurantAcceptanceStatus: 'accepted'});

      if(order.subtotal > 0) {
        // Issue Peepl rewards
        // (5% order total in pence) / 10 pence (value of PPL token)
        var rewardAmount = (order.subtotal * 0.05) / 10;

        await sails.helpers.issuePeeplReward.with({
          rewardAmount: rewardAmount,
          recipient: order.customerWalletAddress
        });

        await Order.updateOne({publicId: inputs.orderId})
        .set({rewardsIssued: rewardAmount});
      }
    } else if (inputs.restaurantAccepted === false) {
      // TODO: Isssue refund to customer
      await Order.updateOne({publicId: inputs.orderId})
      .set({restaurantAcceptanceStatus: 'rejected'});
    }

    // Send notification to customer that their order has been accepted/declined.
    await sails.helpers.sendFirebaseNotification.with({
      topic: 'order-' + order.id,
      title: 'Order update',
      body: 'Your order has been ' + (inputs.restaurantAccepted ? 'accepted 😎' : 'declined 😔') + '.'
    });

    // All done.
    return;

  }

};
