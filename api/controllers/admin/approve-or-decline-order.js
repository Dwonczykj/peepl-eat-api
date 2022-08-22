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
    // TODO: Check if delivery slot is in future

    var order = await Order.findOne({publicId: inputs.orderId});

    if(order.restaurantAcceptanceStatus === 'accepted') {
      // Restaurant has previously accepted, they cannot cancel the order after this.
      throw new Error('Restaurant has already accepted this order.');
    }

    if(inputs.restaurantAccepted === true) {
      await Order.updateOne({publicId: inputs.orderId})
      .set({restaurantAcceptanceStatus: 'accepted'});

      // Issue Peepl rewards
      // (5% order total in pence) / 10 pence (value of PPL token)
      var rewardAmount = (order.total * 0.05) / 100;

      await sails.helpers.issuePeeplReward.with({
        rewardAmount: rewardAmount,
        recipient: order.customerWalletAddress
      });

      await Order.updateOne({publicId: inputs.orderId})
      .set({rewardsIssued: rewardAmount});
    } else if (inputs.restaurantAccepted === false) {
      await Order.updateOne({publicId: inputs.orderId})
      .set({restaurantAcceptanceStatus: 'declined'});
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
