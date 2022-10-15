const axios = require('axios').default;

module.exports = {


  friendlyName: 'revert payment partial',


  description: 'Partially reverts a payment for a partially fulfilled order',


  inputs: {
    paymentId: {
      type: 'string',
      description: 'The paymentIntentId of the original transaction',
      required: true,
    },
    refundRequestGBPx: {
      type: 'number',
      description: 'The total GBPx to be refunded.',
      required: true
    },
    refundRequestPPL: {
      type: 'number',
      description: 'The total PPL to be refunded.',
      required: true
    },
    refundRecipientWalletAddress: {
      type: 'string',
      description: 'The wallet address to receive the payment.',
      required: true
    },
    recipientName: {
      type: 'string',
      description: 'The display name of the recipient.'
    },
    refundFromName: {
      type: 'string',
      description: 'The name of the vendor issueing the refund'
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },
    timedOut: {
      description: 'The request timed out.'
    }

  },


  fn: async function (inputs, exits) {
    const requestedAt = Date.now();
    const newRefundGBPx = await Refund.create({
      paymentIntentId: inputs.paymentId,
      currency: sails.config.custom.vegiDigitalStableCurrencyTicker,
      amount: inputs.refundRequestGBPx,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      requestedAt: requestedAt,
      refundStatus: "unpaid",
    }).fetch();
    const newRefundPPL = await Refund.create({
      paymentIntentId: inputs.paymentId,
      currency: sails.config.custom.vegiGreenPointsTicker,
      amount: inputs.refundRequestGBPx,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      requestedAt: requestedAt,
      refundStatus: "unpaid",
    }).fetch();

    const instance = axios.create({
      baseURL: sails.config.custom.peeplPayUrl,
      timeout: 2000,
      headers: { 'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey }
    });

    //TODO: request refund for partial amount of order from peeplPay community manager wallet address back to the customer.
    //TODO: Assert that the paymentAmount == the sum of value of the items (+ % of service charge?) - discount
    instance
      .post("/payment_refunds", {
        amount: inputs.paymentAmount,
        originalPaymentIntentId: inputs.paymentId,
        recipientWalletAddress: inputs.refundRecipientWalletAddress,
        vendorDisplayName: inputs.refundFromName,
        webhookAddress:
          sails.config.custom.peeplWebhookAddressCustomerUpdatePaidOrder,
      })
      .then(async (response) => {
        // TODO: Check whether request for refund was accepted and can be fulfilled by the peeplPay service.
        var paymentIntentId = response.data.paymentIntent.publicId;
        return exits.success({ paymentIntentId });
      })
      .catch((err) => {
        sails.log.warn(err);
        // TODO: Error handling in case this fails
        return exits.timedOut();
      });
  }


};

