module.exports = {


  friendlyName: 'Peepl pay Update Paid Order webhook', //peeplWebhookAddressCustomerUpdatePaidOrder


  description: '',


  inputs: {
    publicId: {
      type: 'string'
    },
    metadata: {
      type: 'ref',
    },
    status: {
      type: 'string'
    }
  },


  exits: {
  },


  fn: async function (inputs, exits) {

    var newOrder = await Order.findOne({
      publicId: inputs.metadata.orderId,
      paymentIntentId: inputs.metadata.paymentIntentId,
      customerWalletAddress: inputs.metadata.customerWalletAddress
    });

    // send a refund to the user:
    await sails.helpers.revertPaymentPartial.with({
      paymentId: newOrder.paymentIntentId,
      refundAmountGBPx: inputs.refundRequestGBPx,
      refundRequestPPL: inputs.refundRequestPPL,
      refundRecipientWalletAddress: newOrder.customerWalletAddress,
      recipientName: newOrder.deliveryName,
      refundFromName: newOrder.vendor.name,
    });

    // create a new request for the vendor to check that they con service the updated order.
    await sails.helpers.sendSmsNotification.with({
      to: newOrder.vendor.phoneNumber,
      body: `You have received an updated order from vegi resulting from the partial fulfillment of order: ${newOrder.parentOrder.publicId}. ` +
        `The order is scheduled for delivery between ${newOrder.fulfilmentSlotFrom} and ${newOrder.fulfilmentSlotTo}. ` +
        `To accept or decline: ` +
        sails.config.custom.baseUrl + '/admin/approve-order/' + newOrder.publicId
    });

    // All done.
    return exits.success({
      orderID: newOrder.publicId,
      paymentIntentID: newOrder.paymentIntentId,
      calculatedOrderTotal: newOrder.total
    });

  }


};
