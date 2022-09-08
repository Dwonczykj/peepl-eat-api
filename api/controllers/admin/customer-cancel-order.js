const OrderItem = require("../../models/OrderItem");

module.exports = {


  friendlyName: 'Customer cancel order',


  description: 'A handle for customers to repond to requests to cancel their order when a vendor was unable to service parts or all of an order.',


  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    customerWalletAddress: {
      type: 'string',
      required: true
    }
  },


  exits: {
    orderNotFound: {
      statuscode: 404,
      description: 'Order not found either because publicId does not exist or because the customerWalletAddress does not agree or because the order has already been flagged as completed.'
    },
    orderAlreadyCompleted: {
      statuscode: 401,
      description: 'Order has already been flagged as completed.'
    },
    orderNotPaid: {
      statuscode: 401,
      description: 'order has not yet been paid for so no refund needs to be processed'
    }
  },


  fn: async function (inputs, exits) {
    var order = await Order.findOne({
      publicId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
    });

    if (!order) {
      return exits.orderNotFound();
    }

    if (order.completedFlag !== '') {
      return exits.orderAlreadyCompleted();
    }

    //Flag the order as cancelled
    await Order.updateOne({ publicId: inputs.orderId })
      .set({ completedFlag: 'cancelled' });

    if (order.paymentStatus === 'paid') {
      // Request a reversion of the full payment from the paymentId, 
      // ! dont use order total as this may bne updated from updating the items on the order
      //TODO: Implement the below helper method
      await sails.helpers.revertPaymentFull.with({
        paymentId: order.paymentIntentId,
        refundAmount: order.total,
        refundRecipientWalletAddress: order.customerWalletAddress,
        recipientName: order.deliveryName,
        refundFromName: order.vendor.name,
      });

      // revert the token issuance
      //TODO: Implement the below helper method
      await sails.helpers.revertPeeplRewardIssue.with({
        peeplPayPaymentIntentId: order.paymentIntentId,
        recipient: order.customerWalletAddress
      });

      await sails.helpers.sendFirebaseNotification.with({
        topic: 'order-' + order.publicId,
        title: 'Order update',
        body: 'Your refund has been requested 😎.'
      });
    } else {
      return exits.orderNotPaid();
    }

    // All done.
    return;

  }

};
