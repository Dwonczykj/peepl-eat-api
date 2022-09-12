var axios = require('axios');
module.exports = {


  friendlyName: 'Issue peepl reward',


  description: 'Issue the PPL tokens to the customer.',


  inputs: {
    rewardAmount: {
      type: 'number',
      required: true
    },
    recipient: {
      type: 'string',
      regex: /^0x[a-fA-F0-9]{40}$/,
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const instance = axios.create({
      baseURL: sails.config.custom.peeplPayUrl,
      timeout: 2000,
      headers: {'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey}
    });

    var data = {
      rewardAmount: inputs.rewardAmount.toString(),
      recipientWallet: inputs.recipient,
    };

    instance.post('/reward/issue-reward', data)
    .then(async () => {
      return exits.success({});
    })
    .catch((err) => {
      sails.log(err);
      // TODO: Error handling in case this fails
      return exits.error();
    });
  }


};

