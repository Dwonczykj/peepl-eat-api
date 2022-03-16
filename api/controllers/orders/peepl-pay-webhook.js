module.exports = {


  friendlyName: 'Peepl pay webhook',


  description: '',


  inputs: {
    publicId: {
      type: 'string'
    },
    status: {
      type: 'string'
    }
  },


  exits: {
  },


  fn: async function (inputs) {

    var unixtime = Date.now();

    // Update order with payment ID and time
    var order = await Order.updateOne({paymentIntentId: inputs.publicId})
    .set({
      paymentStatus: 'paid',
      paidDateTime: unixtime
    });

    await sails.helpers.issuePeeplReward.with({
      rewardAmount: (order.total * 0.1) / 10, // (10% order total in pence) / 10 pence (value of PPL token)
      recipient: order.customerWalletAddress
    });

    // // Send order confirmation email
    // await sails.helpers.sendTemplateEmail.with({
    //   template: 'email-order-confirmation-new',
    //   templateData: {order: orderDetails},
    //   to: orderDetails.deliveryEmail,
    //   subject: 'Peepl Eat Order Confirmed - #' + orderDetails.id ,
    //   layout: false,
    // });

    // All done.
    return;

  }


};
