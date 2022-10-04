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


<<<<<<< HEAD
  fn: async function (inputs) {
    var client = axios.create({
      baseURL: sails.config.custom.fuseStudioBaseUrl,
      timeout: 20000,
      headers: { 'API-SECRET': 'sk_q8TiAxOSniziV6G4CPHY1Ql1' } //TODO: Move to .env
=======
  fn: async function (inputs, exits) {
    const instance = axios.create({
      baseURL: sails.config.custom.peeplPayUrl,
      timeout: 2000,
      headers: {'Authorization': 'Basic ' + sails.config.custom.peeplAPIKey}
>>>>>>> upstream/main
    });

    var data = {
      rewardAmount: inputs.rewardAmount.toString(),
      recipientWallet: inputs.recipient,
    };

<<<<<<< HEAD
    await client.post('admin/tokens/transfer?apiKey=pk_FDM9_lyd9leeOG4utgmzfr6h', data)
      .catch((err) => {
        sails.log.error(err);
        throw new Error('Error issuing PPL token reward.');
      });

    return;
=======
    instance.post('/reward/issue-reward', data)
    .then(async () => {
      return exits.success({});
    })
    .catch((err) => {
      sails.log(err);
      // TODO: Error handling in case this fails
      return exits.error();
    });
>>>>>>> upstream/main
  }


};

