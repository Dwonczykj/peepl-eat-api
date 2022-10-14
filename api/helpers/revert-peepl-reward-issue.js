const axios = require('axios').default;
const { v4: uuidv4 } = require("uuid");
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
    },
    rewardsIssued: {
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
    },
    requestFailed: {
      description: 'unable to carry out peepl reward reversion',
      error: null,
    }

  },


  fn: async function (inputs, exits) {
    var dontActuallySend =
      sails.config.environment === "test" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST;
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.revertPeeplRewardIssue will not request rewards points reversions.
      Rewards points issue would have been retrieved from ${inputs.recipient} with paymentIntentId: ${inputs.paymentId}`);
      return exits.success({
        paymentIntentId: "dummy_refund_payment_id_" + uuidv4(),
      });
    }
    let _instance;
    try {
	    _instance = axios.create({
	      baseURL: sails.config.custom.peeplPayUrl,
	      timeout: 2000,
	      headers: { 'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey }
	    });
    } catch (error) {
      sails.log.error(
        `Unable to create axios client to connect to ${sails.config.custom.peeplPayUrl} in helpers.revertPeeplRewardIssue`
      );
      return exits.requestFailed(
        new Error(
          `Unable to create axios client to connect to ${sails.config.custom.peeplPayUrl} in helpers.revertPeeplRewardIssue: ${error}`
        )
      );
    }
    const instance = _instance;

    let _revertRewardAmount;
    try {
	    _revertRewardAmount = await sails.helpers.calculatePPLReward.with({
	      amount: inputs.paymentAmountBeingRefunded,
	      orderType: OrderTypeEnum.vegiEats
	    });
    } catch (error) {
      return exits.requestFailed(
        new Error(
          `Unable to check PPL reward calculation in helpers.revertPeeplRewardIssue: ${error}`
        )
      );
    }
    const revertRewardAmount = _revertRewardAmount;
    if(revertRewardAmount !== inputs.rewardsIssued){
      try {
        const order = await Order.findOne({
          paymentIntentId: inputs.paymentId,
        });

        await sails.helpers.raiseVegiSupportIssue.with({
          orderId:
            order.id || "UNKNOWN with paymentIntentId: " + inputs.paymentId,
          title: "order_reward_issue_failed_",
          message: `Order Reversion of Rewards Points Issue Failed: ${order.publicId} -> Failed to Revert PPL Issue from wallet '${order.customerWalletAddress}' due to mismatched rewards issued.`,
        });
      } catch (error) {
        sails.log.error(
          "failed to raise vegi support issue to log a failed rewards points issue for an accepted order"
        );
      }
      return exits.requestFailed(
        new Error(
          `Unable to revert peepl reward as calculated amount: ${revertRewardAmount} !== order.rewardsIssued: ${inputs.rewardsIssued}`
        )
      );
    }

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

