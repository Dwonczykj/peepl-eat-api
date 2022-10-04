const OrderItem = require('../../models/OrderItem');

const OrderTypeEnum = {
  vegiEats: 'vegiEats',
  vegiPays: 'vegiPays',
};

Object.freeze(OrderTypeEnum);


module.exports = {


  friendlyName: 'Approve or decline order',


  description: '',


  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    orderFulfilled: {
      type: 'string',
      isIn: ['accept', 'reject', 'partial'],
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

    success: {
      statusCode: 200,
      data: null,
    }
  },


  fn: async function (inputs, exits) {

    var order = await Order.findOne({
      publicId: inputs.orderId,
      fulfilmentSlotFrom: {
        '>=': new Date()
      },
      completedFlag: '',
    });

    if (!order) {
      return exits.orderNotFound();
    }

    if (order.restaurantAcceptanceStatus !== 'pending') {

      // Restaurant has previously accepted or declined the order, they cannot modify the order acceptance after this.
      return exits.orderNotPending();
    }


    if (order.paymentStatus !== 'paid') {

      // Order is not paid
      return exits.orderNotPaidFor();
    }


    if (inputs.orderFulfilled === 'accept') {
      await Order.updateOne({ publicId: inputs.orderId })
        .set({ restaurantAcceptanceStatus: 'accepted' });


      // Issue Peepl rewards
      var rewardAmount = await sails.helpers.calculatePPLReward.with({
        amount: order.total,
        orderType: OrderTypeEnum.vegiEats
      });

      await sails.helpers.issuePeeplReward.with({
        rewardAmount: rewardAmount,
        recipient: order.customerWalletAddress
      });

<<<<<<< HEAD
      await Order.updateOne({ publicId: inputs.orderId })
        .set({ rewardsIssued: rewardAmount });

      // Send notification to customer that their order has been accepted/declined.
      await sails.helpers.sendFirebaseNotification.with({
        topic: 'order-' + order.publicId,
        title: 'Order update',
        body: 'Your order has been accepted 😎.'
      });
    } else if (inputs.orderFulfilled === 'reject') {

      await Order.updateOne({ publicId: inputs.orderId })
        .set({ restaurantAcceptanceStatus: 'rejected' });

      // send a refund to the user:
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
        body: 'Your order has been declined 😔.'
      });
    } else if (inputs.orderFulfilled === 'partial') {

      var response = await sails.helpers.updateItemsForOrder.with({
        orderId: inputs.orderId,
        retainItems: inputs.retainItems,
        removeItems: inputs.removeItems
      });

      if (!response || !response['validRequest']) {
        sails.log.warn('Bad partial fulfilment requested by vendor on approve-or-decline-order action')
        return exits.badPartialFulfilmentRequest();
      }

      await sails.helpers.requestUpdateFromConsumer.with({// todo: dont need to revert peepl tokens as only sent in accept clause above.
        customerWalletAddress: order.customerWalletAddress,
        orderPublicId: order.publicId,
      });

      // * wait for user response via /admin/customer-update-order controller action.
    } else {
      sails.log.warn('Unknown orderFulfilled status passed to approve-or-decline-order action.');
=======
      await Order.updateOne({publicId: inputs.orderId})
      .set({rewardsIssued: rewardAmount});
    } else if (inputs.restaurantAccepted === false) {
      // TODO: Isssue refund to customer
      await Order.updateOne({publicId: inputs.orderId})
      .set({restaurantAcceptanceStatus: 'rejected'});
>>>>>>> upstream/main
    }

    // All done.
    return exits.success();

  }

};
