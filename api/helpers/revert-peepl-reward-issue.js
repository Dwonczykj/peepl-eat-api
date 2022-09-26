const axios = require('axios').default;

const OrderTypeEnum = {
  vegiEats: 'vegiEats',
  vegiPays: 'vegiPays',
};

Object.freeze(OrderTypeEnum);

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
    paymentAmountBeingRefunded: {
      type: 'number',
      required: true,
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

    const revertRewardAmount = await sails.helpers.calculatePPLReward.with({
      amount: inputs.paymentAmountBeingRefunded,
      orderType: OrderTypeEnum.vegiEats
    });

    //request refund for full amount of order from peeplPay community manager wallet address back to the customer.
    instance.post('/revert_reward_issue', { //Check Stripe API and aim to keep peeplPay requests inline with stripAPI 
      amount: revertRewardAmount,
      recipientWalletAddress: inputs.refundRecipientWalletAddress,
      webhookAddress: null //! no callback required for now as reward sent back to vegi. We can track this elsewhere.
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

