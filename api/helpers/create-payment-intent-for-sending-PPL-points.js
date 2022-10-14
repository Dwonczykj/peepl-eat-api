const axios = require('axios').default;

module.exports = {


  friendlyName: 'Create payment intent for sending PPL points',


  description: '',


  inputs: {
    amountPPL: {
      type: 'number',
      description: 'The total PPL to be transacted.',
      required: true
    },
    orderId: {
      type: 'string',
      description: 'public orderid linked to the original issued reward',
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
      headers: { 'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey }
    });

    var order = await Order.findOne({ publicId: inputs.orderId });

    instance.post('/issue_rewards', { //TODO: Request this custom end point on PeeplPay,as it doesnt contain any GBPx moves, its just rewards, it should not connect to stripe and should just check for updates for reward issue transfer.
      amount: inputs.amountPPL,
      recipientWalletAddress: inputs.recipientWalletAddress,
      vendorDisplayName: inputs.recipientName,
      metadata: {
        orderId: inputs.orderId,
        customerWalletAddress: order.customerWalletAddress,
      },
      webhookAddress: sails.config.custom.peeplWebhookAddressCustomerUpdatePaidOrder
    })
      .then(async (response) => {
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

