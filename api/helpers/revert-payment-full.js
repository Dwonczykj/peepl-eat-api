const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

module.exports = {


  friendlyName: 'revert payment full',


  description: 'Reverts a payment for a fulfilled order',


  inputs: {
    paymentId: {
      type: 'string',
      description: 'The paymentIntentId of the original transaction',
      required: true,
    },
    refundAmount: {
      type: 'number',
      description: 'The total to be transacted.',
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
    const newRefund = await Refund.create({
      paymentIntentId: inputs.paymentId,
      currency: sails.config.custom.vegiDigitalStableCurrencyTicker, //! for now refund the whole amount in GBPx
      amount: inputs.refundAmount,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      requestedAt: Date.now(),
      refundStatus: 'unpaid',
    }).fetch();

    var dontActuallySend =
      sails.config.environment === 'test' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST;
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.revertPaymentFull will not request payment reversions.
      Payment Refund would have been issued to ${inputs.refundFromName} for amount: ${inputs.refundAmount}`);
      return exits.success({
        paymentIntentId: 'dummy_refund_payment_id_' + uuidv4(),
      });
    }

    const instance = axios.create({
      baseURL: sails.config.custom.peeplPayUrl, //TODO: In test environment, override this...
      timeout: 2000,
      headers: { 'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey }
    });

    //TODO: request refund for full amount of order from peeplPay community manager wallet address back to the customer.
    //TODO: Assert that the refundAmount == the sum of value of the items (+ % of service charge?) - discount
    instance.post('/payment_refunds', {
      amount: inputs.refundAmount,
      originalPaymentIntentId: inputs.paymentId,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      vendorDisplayName: inputs.refundFromName,
      webhookAddress: sails.config.custom.peeplPayRefundWebhookAddress
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

