var axios = require('axios');
module.exports = {


  friendlyName: 'raise vegi support issue',


  description: 'Email & notify vegi support',


  inputs: {
    orderId: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    title: {
      type: 'string',
      required: true
    },
    message: {
      type: 'string',
      required: true
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    var title = inputs.title;
    if (inputs.orderId) {
      title = `${title} - OrderId: ${inputs.orderId}`;
    }
    await sails.helpers.sendSMSNotification.with({
      to: sails.config.custom.internalPhoneNumber,
      body: `${title}\n${inputs.message}`,
    });
    await sails.helpers.sendTemplateEmail.with({
      to: sails.config.custom.internalEmailAddress,
      subject: title,
      template: 'email-support-request',
      templateData: {
        orderId: inputs.orderId,
        message: inputs.message
      },
      layout: false,
    }).intercept('', (err) => {
      sails.log.info('Error sending a support request!');
      sails.log.warn(err);
    });

    return;
  }


};

