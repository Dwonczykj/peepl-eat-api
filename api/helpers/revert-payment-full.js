const axios = require('axios').default;

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
    const instance = axios.create({
      baseURL: sails.config.custom.peeplPayUrl,
      timeout: 2000,
      headers: { 'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey }
    });

    //TODO: request refund for full amount of order from peeplPay community manager wallet address back to the customer.
    //TODO: Assert that the paymentAmount == the sum of value of the items (+ % of service charge?) - discount
    instance.post('/payment_refunds', {
      amount: inputs.paymentAmount,
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

