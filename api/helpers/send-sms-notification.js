const twilio = require('twilio');

module.exports = {


  friendlyName: 'Send sms notification',


  description: '',


  inputs: {
    body: {
      type: 'string',
      description: 'The body of the SMS to be sent.',
      required: true
    },
    to: {
      type: 'string',
      description: 'The phone number to send the SMS to.',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    var dontActuallySend =
      sails.config.environment === "test" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST;
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.sendSmsNotification will not send notifications.
      Message would have been send to ${inputs.to} with body: ${inputs.body}`);
      return exits.success();
    }
    const twilioClient = new twilio(sails.config.custom.twilioSID, sails.config.custom.twilioAuthToken);

    twilioClient.messages.create({
      body: inputs.body,
      to: inputs.to,
      from: 'VegiApp'
    })
    .then((message) => {
      return message.sid;
    })
    .catch((err) => {
      throw new Error(err.message);
    });

    return exits.success();

  }


};

