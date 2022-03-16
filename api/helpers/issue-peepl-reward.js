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
      timeout: 1000,
      headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50QWRkcmVzcyI6IjB4NzU1QzY2MTcxNDkzMUIxQWM5MDRhOGVjYkRENzYxMDY4OUQ4MTJBYyIsImlzQ29tbXVuaXR5QWRtaW4iOnRydWUsImFwcE5hbWUiOiJSb29zdCIsImlhdCI6MTYwNTc5NzExNX0.ozqwhxFjTYUUoexnkBOY_TsW4sL_574gWZHqzHhD8Pk'}
    });

    // Issue PPL token reward
    var data = {
      tokenAddress: sails.config.custom.pplTokenAddress,
      networkType: 'fuse',
      amount: inputs.rewardAmount.toString(),
      from: sails.config.custom.pplRewardsPoolAddress,
      to: inputs.recipient
    };

    await client.post('admin/tokens/transfer', data);

    return;
  }


};

