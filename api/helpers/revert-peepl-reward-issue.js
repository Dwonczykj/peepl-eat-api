const axios = require('axios').default;

module.exports = {


  friendlyName: 'revert peepl reward issue',


  description: 'Reverts tokens issues for an order',


  inputs: {
    paymentId: {
      type: 'string',
      description: 'The paymentIntentId of the original transaction',
      required: true,
    },
    recipient: {
      type: 'string',
      description: 'The name of the recipient.'
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
    instance.post('/revert_reward_issue', { //Check Stripe API and aim to keep peeplPay requests inline with stripAPI 
      amount: inputs.paymentAmount,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      vendorDisplayName: inputs.refundFromName,
      webhookAddress: sails.config.custom.peeplWebhookAddress //TODO: Add another peeplWebhook for full refunds for peeplPay service to post back to
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

