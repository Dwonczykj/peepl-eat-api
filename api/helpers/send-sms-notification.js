const twilio = require('twilio');

module.exports = {
  friendlyName: 'Send sms notification',

  description: '',

  inputs: {
    body: {
      type: 'string',
      description: 'The body of the SMS to be sent.',
      required: true,
    },
    to: {
      type: 'string',
      description: 'The phone number to send the SMS to.',
      required: true,
    },
    data: {
      type: 'ref',
      defaultsTo: {},
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    const newNotification = await Notification.create({
      recipient: inputs.to,
      type: 'sms',
      sentAt: Date.now(),
      title: inputs.body,
      order: (inputs.data && inputs.data.orderId) || null,
      metadata:
        inputs.data && inputs.data.orderId
          ? JSON.stringify({
            model: 'order',
            id: inputs.data.orderId,
          })
          : JSON.stringify({
            model: '',
            id: null,
          }),
    }).fetch();

    var dontActuallySend =
      sails.config.environment === 'test' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST;
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.sendSmsNotification will not send notifications.
      Message would have been send to ${inputs.to} with body: ${inputs.body}`);
      return exits.success();
    }
    const twilioClient = new twilio(
      sails.config.custom.twilioSID,
      sails.config.custom.twilioAuthToken
    );

    twilioClient.messages
      .create({
        body: inputs.body,
        to: inputs.to,
        from: 'VegiApp',
      })
      .then((message) => {
        return message.sid;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    return exits.success({notification: newNotification});
  },
};

