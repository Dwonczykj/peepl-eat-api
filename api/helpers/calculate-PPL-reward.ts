declare var Order: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var Discount: any;

const OrderTypeEnum = {
  vegiEats: 'vegiEats',
  vegiPays: 'vegiPays',
};

Object.freeze(OrderTypeEnum);

module.exports = {

  friendlyName: 'Calculate PPL reward',

  description: 'This helper function will calculate the number of PPL tokens to reward a vegi Order.',

  inputs: {
    amount: {
      type: 'number',
      description: 'Transcation / Order Amount to calculate a reward from',
      required: true
    },
    orderType: {
      type: 'string',
      isIn: [OrderTypeEnum.vegiPays, OrderTypeEnum.vegiEats],
      required: true,
    }
  },

  exits: {

    success: {
      description: 'All done.',
      data: null,
    },

  },

  fn: async function (inputs, exits) {

    // (5% order total in pence (GBPx)) / 10 pence (value of PPL token)
    var rewardAmount = (inputs.amount * sails.config.custom.vegiEatsRewardPcnt) / sails.config.custom.PPLTokenValueInPence;

    return exits.success({
      data: rewardAmount
    });
  }

};
