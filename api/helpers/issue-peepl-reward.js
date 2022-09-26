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
      regex: /^0x[a-fA-F0-9]{40}$/
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    var client = axios.create({
      baseURL: sails.config.custom.fuseStudioBaseUrl,
      timeout: 20000,
      headers: { 'API-SECRET': 'sk_q8TiAxOSniziV6G4CPHY1Ql1' } //TODO: Move to .env
    });

    // Issue PPL token reward
    var data = {
      tokenAddress: sails.config.custom.pplTokenAddress,
      networkType: 'fuse',
      amount: inputs.rewardAmount.toString(),
      from: sails.config.custom.pplRewardsPoolAddress,
      to: inputs.recipient
    };

    await client.post('admin/tokens/transfer?apiKey=pk_FDM9_lyd9leeOG4utgmzfr6h', data)
      .catch((err) => {
        sails.log.error(err);
        throw new Error('Error issuing PPL token reward.');
      });

    return;
  }


};

