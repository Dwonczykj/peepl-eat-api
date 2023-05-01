const OrderItem = require('../../models/OrderItem');

module.exports = {
  friendlyName: 'Customer cancel order',

  description:
    'A handle for customers to repond to requests to cancel their order when a vendor was unable to service parts or all of an order.',

  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true,
    },
    customerWalletAddress: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    orderNotFound: {
      statusCode: 404,
      description:
        'Order not found either because publicId does not exist or because the customerWalletAddress does not agree or because the order has already been flagged as completed.',
    },
    orderAlreadyCompleted: {
      statusCode: 401,
      description: 'Order has already been flagged as completed.',
    },
    orderNotPaid: {
      statusCode: 401,
      description:
        'order has not yet been paid for so no refund needs to be processed',
    },
    incompleteOrderInformationStoredDB: {
      statusCode: 501,
      description: 'the stored order doesnt have the paymentIntentId set'
    }
  },

  fn: async function (inputs, exits) {
    var order = await Order.findOne({
      publicId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
    }).populate('vendor');

    if (!order || !order.vendor) {
      return exits.orderNotFound();
    }

    if (order.completedFlag !== '') {
      return exits.orderAlreadyCompleted();
    }

    const formulateMoney = (amount) => ('£' + (amount / 100.0).toFixed(2));

    //Flag the order as cancelled
    await Order.updateOne({ publicId: inputs.orderId }).set({
      completedFlag: 'cancelled',
    });

    if (!order.paymentIntentId || !order.customerWalletAddress) {
      return exits.incompleteOrderInformationStoredDB();
    }

    if (order.paymentStatus === 'paid') {
      // Request a reversion of the full payment from the paymentId,
      await sails.helpers.revertPaymentFull.with({
        paymentId: order.paymentIntentId,
        refundAmount: order.total,
        refundRecipientWalletAddress: order.customerWalletAddress,
        recipientName: order.deliveryName,
        refundFromName: order.vendor.name,
      });
      // revert the token issuance
      if (
        order.rewardsIssued > 0 &&
        (order.restaurantAcceptanceStatus === 'accepted' ||
          order.restaurantAcceptanceStatus === 'partially fulfilled')
      ) {
        // ! This should not be possible as we shouldnt allow customers to cancel original orders that were accepted by the venodr, and if partially fulfilled, then no rewards are issued before the child order is accepted.
        // await sails.helpers.revertPeeplRewardIssue.with({
        //   paymentId: order.paymentIntentId,
        //   recipient: order.customerWalletAddress,
        //   paymentAmountBeingRefunded: order.total,
        //   rewardsIssued: order.rewardsIssued,
        // });
      }

      await sails.helpers.broadcastFirebaseNotificationForTopic.with({
        topic: 'order-' + order.publicId,
        title: 'Order update',
        body: `Your refund for ${formulateMoney(
          order.total
        )} has been requested 😎.`,
      });
    } else {
      return exits.orderNotPaid();
    }

    // All done.
    return exits.success();
  },
};
