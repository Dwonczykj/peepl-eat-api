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
    currency: {
      type: 'string',
      required: false,
      defaultsTo: 'gbp',
    },
    recipientWalletAddress: {
      type: 'string',
      description: 'The wallet address to receive the payment.',
      required: true
    },
    recipientName: {
      type: 'string',
      description: 'The display name of the recipient.'
    },
    headers: {
      type: 'json',
      defaultsTo: {},
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

    instance.post('/payment_intents', { //configured in routes.js to map to  payments route
      amount: inputs.paymentAmount,
      currency: inputs.currency,
      vendorDisplayName: inputs.recipientName,
      recipientWalletAddress: inputs.recipientWalletAddress,
      webhookAddress: sails.config.custom.peeplWebhookAddress
    }, {
      headers: inputs.headers,
    })
    .then(async (response) => {
      var paymentIntentId = response.data.paymentIntent.publicId;
      return exits.success({paymentIntentId});
    })
    .catch((err) => {
      sails.log.warn(err);
      // TODO: Error handling in case this fails
      return exits.timedOut();
    });
  }


};

