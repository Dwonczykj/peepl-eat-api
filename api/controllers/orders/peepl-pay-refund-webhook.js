module.exports = {


  friendlyName: 'Peepl pay refunds webhook',


  description: '',


  inputs: {
    publicId: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['success', 'failure']
    }
  },


  exits: {
    success: {
      statusCode: 200,
      data: null
    }
  },


  fn: async function (inputs, exits) {

    var refundSucceeded = inputs.status === 'success';

    var unixtime = Date.now();

    // Update order with payment ID and time
    await Order.updateOne({ paymentIntentId: inputs.publicId })
      .set({
        completedFlag: 'refunded',
        refundDateTime: unixtime
      });

    var order = await Order.findOne({
      paymentIntentId: inputs.publicId,
    })
      .populate('vendor');

    var formulateMoney = function (amount) {
      '£' + (amount / 100.0).toFixed(2);
    };

    await sails.helpers.sendSmsNotification.with({
      to: order.deliveryPhoneNumber,
      body: 'Your vegi order: ' + order.publicId + ' has been rufunded for ' + formulateMoney(order.total)
    });
    await sails.helpers.sendSmsNotification.with({
      to: order.vendor.phoneNumber,
      body: 'Refund complete for vegi order: ' + order.publicId + '. Order has been rufunded to customer for ' + formulateMoney(order.total)
    });
    var refundStr = refundSucceeded ? 'success' : 'failure';
    var refundWorked = refundSucceeded ? 'has been successfully refunded' : 'failed to be refunded';
    await sails.helpers.raiseVegiSupportIssue.with({
      orderId: order.publicId,
      title: 'order_refund_' + refundStr,
      message: `Order Refund ${refundStr}: ${order.publicId} ${refundWorked} to wallet '${order.customerWalletAddress}' for ` + formulateMoney(order.total) + '.'
    });

    return exits.success();
  }


};
