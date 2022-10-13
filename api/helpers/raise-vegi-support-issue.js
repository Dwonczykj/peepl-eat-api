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
    emailFailed: {
      description: 'email failed',
    },
    smsFailed: {
      description: 'SMS failed',
    }

  },


  fn: async function (inputs, exits) {
    var title = inputs.title;
    if (inputs.orderId) {
      title = `${title} - OrderId: ${inputs.orderId}`;
    }
    
    try {
	    await sails.helpers.sendSmsNotification.with({
        to: sails.config.custom.internalPhoneNumber,
        body: `${title}\n${inputs.message}`,
      });
    } catch (error) {
      sails.log.error(`Error occurred in helpers/raiseVegiSupportIssue trying to send SMS: ${error}`);
      return exits.smsFailed(error);
    }
    sails.log(`Send email to vegi support`);
    try {
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
    } catch (error) {
      sails.log.error('Error occurred in helpers/raiseVegiSupportIssue trying to send template email to internal vegi email address.');
      return exits.emailFailed(error);
    }

    return exits.success();
  }


};

