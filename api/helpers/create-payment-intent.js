const axios = require('axios').default;

module.exports = {


  friendlyName: 'Create payment intent',


  description: '',


  inputs: {
    paymentAmount: {
      type: 'number',
      description: 'The total to be transacted.',
      required: true
    },
    recipientWalletAddress: {
      type: 'string',
      description: 'The wallet address to receive the payment.',
      required: true
    },
    recipientName: {
      type: 'string',
      description: 'The display name of the recipient.'
    }
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
      headers: {'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey}
    });

    instance.post('/payment_intents', {
      amount: inputs.paymentAmount,
      recipientWalletAddress: inputs.recipientWalletAddress,
      vendorDisplayName: inputs.recipientName,
      webhookAddress: sails.config.custom.peeplWebhookAddress
    })
    .then(async (response) => {
      var paymentIntentId = response.data.paymentIntent.publicId;
      return exits.success({paymentIntentId});
    })
    .catch((err) => {
      console.log(err);
      // TODO: Error handling in case this fails
      return exits.timedOut();
    });
  }


};

