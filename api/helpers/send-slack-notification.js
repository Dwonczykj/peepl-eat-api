const axios = require('axios').default;

module.exports = {


  friendlyName: 'Send slack notification',


  description: '',


  inputs: {
    order: {
      type: 'ref',
      description: 'The order to send a notification for.',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    // Send a notification to Slack with the order details
    if(sails.config.environment === 'production') {
      sails.log.warn(`NEW CHANNEL "vegi-order-list" -> Sending slack notification for ${inputs.order.id}`);
      const instance = axios.create({
        baseURL: sails.config.custom.slackWebhookUrl,
        timeout: 2000,
        headers: {'Content-Type': 'application/json'}
      });

      instance.post('', {
        text: `New order! ${inputs.order.id} for ${inputs.order.vendor.name}. Details here ${sails.config.custom.baseUrl}/admin/approve-order/${inputs.order.publicId}`
      })
      .catch((err) => {
        sails.log.info(err);
      });
    }

  }


};

