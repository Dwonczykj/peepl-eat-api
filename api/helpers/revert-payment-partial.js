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
      refundStatus: 'unpaid',
    }).fetch();
    const newRefundPPL = await Refund.create({
      paymentIntentId: inputs.paymentId,
      currency: sails.config.custom.vegiGreenPointsTicker,
      amount: inputs.refundRequestGBPx,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      requestedAt: requestedAt,
      refundStatus: 'unpaid',
    }).fetch();

    const instance = axios.create({
      baseURL: sails.config.custom.peeplPayUrl,
      timeout: 2000,
      headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
    });

    //TODO: request refund for partial amount of order from peeplPay community manager wallet address back to the customer.
    //TODO: Assert that the paymentAmount == the sum of value of the items (+ % of service charge?) - discount
    // ~ https://stripe.com/docs/refunds?dashboard-or-api=api#:~:text=To%20refund%20a%20payment%20using,.
    // ~ To refund part of a PaymentIntent, provide an amount parameter as an integer in cents (or the charge currency’s smallest currency unit).
    instance
      .post('/refunds', {
        amount: inputs.paymentAmount,
        payment_intent: inputs.paymentId,
        webhookAddress:
          sails.config.custom.peeplWebhookAddressCustomerUpdatePaidOrder,
        // recipientWalletAddress: inputs.refundRecipientWalletAddress,
        // vendorDisplayName: inputs.refundFromName,
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

