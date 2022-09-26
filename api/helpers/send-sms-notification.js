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


  fn: async function (inputs) {
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

  }


};

