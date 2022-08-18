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

    if(order.restaurantAccepted) {
      // Restaurant has previously accepted, they cannot cancel the order after this.
      throw new Error('Restaurant has already accepted this order.');
    }

    await Order.updateOne({publicId: inputs.orderId})
    .set({restaurantAccepted: inputs.restaurantAccepted});

    // Send notification to customer that their order has been accepted/declined.
    await sails.helpers.sendFirebaseNotification.with({
      topic: 'order-' + order.id,
      title: 'Order update',
      body: 'Your order has been ' + (inputs.restaurantAccepted ? 'accepted 😎' : 'declined 😔') + '.'
    });

    if(inputs.restaurantAccepted){
      // (10% order total in pence) / 10 pence (value of PPL token)
      var rewardAmount = (order.total * 0.05) / 100;

      await sails.helpers.issuePeeplReward.with({
        rewardAmount: rewardAmount,
        recipient: order.customerWalletAddress
      });

      await Order.updateOne({publicId: inputs.orderId})
      .set({rewardsIssued: rewardAmount});
    } else {
      //TODO: Send a refund to the Customer account of amount order.total if the payment has already gone through. -> This should involve a peeplPay.revertTranasction(paymentId) rather than a new call
      //TODO: If on the other hand, restaurantAccepted partialOrder, then we need to ensure that the payment to the vendor was only partial or that we refund the unavailable items.
    }

    // All done.
    return;

  }


};
