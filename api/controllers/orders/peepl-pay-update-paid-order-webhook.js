module.exports = {
  friendlyName: "Peepl pay Update Paid Order webhook", //peeplWebhookAddressCustomerUpdatePaidOrder

  description: "",

  inputs: {
    publicId: {
      type: "string",
      description:
        "the paymentIntentId as this is the publicId that the peeplPay api keeps",
    },
    metadata: {
      type: "ref",
    },
    status: {
      type: "string",
    },
  },

  exits: {
    orderNotFound: {
      statusCode: 404,
    },
    orderMetadataDoesntMatch: {
      statusCode: 400,
    },
    success: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    // var paidOrder = await Order.findOne({
    //   publicId: inputs.metadata.orderId,
    //   paymentIntentId: inputs.metadata.paymentIntentId,
    //   customerWalletAddress: inputs.metadata.customerWalletAddress,
    // });
    var paidOrder = await Order.findOne({
      paymentIntentId: inputs.publicId,
    });

    if (!paidOrder) {
      return exits.orderNotFound();
    }

    if (
      inputs.metadata &&
      Object.keys(inputs.metadata).includes("orderId") &&
      Object.keys(inputs.metadata).includes("paymentIntentId") &&
      Object.keys(inputs.metadata).includes("customerWalletAddress") &&
      (inputs.metadata.orderId !== paidOrder.publidId ||
        inputs.metadata.paymentIntentId !== paidOrder.paymentIntentId ||
        inputs.metadata.customerWalletAddress !==
          paidOrder.customerWalletAddress)
    ) {
      return exits.orderMetadataDoesntMatch();
    }

    try {
      // send a refund to the user:
      await sails.helpers.revertPaymentPartial.with({
        paymentId: paidOrder.paymentIntentId,
        refundAmountGBPx: inputs.refundRequestGBPx,
        refundRequestPPL: inputs.refundRequestPPL,
        refundRecipientWalletAddress: paidOrder.customerWalletAddress,
        recipientName: paidOrder.deliveryName,
        refundFromName: paidOrder.vendor.name,
      });
    } catch (error) {
      sails.log.error(
        `peepl-pay-update-paid-order-webhook failed to partially revert the payment (helpers.revertPaymentPartial): ${error}`
      );
    }

    // create a new request for the vendor to check that they can service the updated order.
    await sails.helpers.sendSmsNotification.with({
      to: paidOrder.vendor.phoneNumber,
      body:
        `You have received an updated order from vegi resulting from the partial fulfillment of order: ${paidOrder.parentOrder.publicId}. ` +
        `The order is scheduled for delivery between ${paidOrder.fulfilmentSlotFrom} and ${paidOrder.fulfilmentSlotTo}. ` +
        `To accept or decline: ` +
        sails.config.custom.baseUrl +
        "/admin/approve-order/" +
        paidOrder.publicId,
    });

    // All done.
    return exits.success({
      orderId: paidOrder.publicId,
      paymentIntentID: paidOrder.paymentIntentId,
      calculatedOrderTotal: paidOrder.total,
    });
  },
};
