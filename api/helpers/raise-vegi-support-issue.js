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

    var orderInternalId;
    try {
      const order = await Order.findOne({
        publicId: inputs.orderId
      });
      if(order){
        orderInternalId = order.id;
      }else{
        orderInternalId = null;
      }
    } catch (error) {
      orderInternalId = null;
    }

    try {
	    await sails.helpers.sendSmsNotification.with({
        to: sails.config.custom.internalPhoneNumber,
        body: `${title}\n${inputs.message}`,
        data: orderInternalId ? {
          orderId: orderInternalId,
        } : {},
      });
    } catch (error) {
      sails.log.error(`Error occurred in helpers/raiseVegiSupportIssue trying to send SMS: ${error}`);
      return exits.smsFailed(error);
    }
    sails.log.info(`Send email to vegi support`);
    try {
	    await sails.helpers.sendTemplateEmail.with({
	      template: 'email-support-request',
	      templateData: {
	        orderId: inputs.orderId,
	        message: inputs.message
	      },
	      to: sails.config.custom.internalEmailAddress,
	      subject: title,
	      layout: false,
	    });
    } catch (error) {
      sails.log.error(`Error occurred in helpers/raiseVegiSupportIssue trying to send template email to internal vegi email address.\n    Error: ${error}`);
      return exits.emailFailed(error);
    }

    return exits.success();
  }


};

