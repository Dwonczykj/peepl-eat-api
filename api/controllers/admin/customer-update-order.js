const OrderItem = require("../../models/OrderItem");

module.exports = {


  friendlyName: 'Customer update order',


  description: 'A handle for customers to repond to requests to update their order when a vendor was unable to service an entire order.',


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
    badRequest: {
      statusCode: 401,
      description: 'likely caused by no items retained in the request'
    },
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {
    var response = await sails.helpers.updateItemsForOrder.with({
      orderId: inputs.orderId,
      retainItems: inputs.retainItems,
      removeItems: inputs.removeItems
    });

    if (!response || !response['validRequest']) {
      sails.log.warn('Bad partial fulfilment requested by consumer app on customer-update-order action');
      return exits.badRequest();
    }

    var order = await Order.findOne({
      publicId: inputs.orderId,
      completedFlag: '',
    });

    // send a refund to the user:
    // TODO: Implement the below helper method - we need a separate method to provide evidence from the vendor & customer of the updated order total.
    await sails.helpers.revertPaymentPartial.with({
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
      recipient: order.customerWalletAddress,
      amountBeingRefunded: order.total // ! Use this to calc the % of the original payment that is being refunded and hence how much of the reward needs to be sent back from the customer wallet to verify the refund.
    });
    // All done.
    return exits.success();

  }

};
