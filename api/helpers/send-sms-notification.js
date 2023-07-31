const twilio = require('twilio');
const plivo = require('plivo');

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
    var newNotification = false;
    try {
      newNotification = await Notification.create({
        recipient: inputs.to,
        type: 'sms',
        sentAt: Date.now(), // TODO: Consider casting sql type to timestamp with a temp colum to do the cast and then channing the type here. and then using moment().format(datetimeStrFormatExactForSQLTIMESTAMP)
        title: inputs.body,
        order:
          (inputs.data &&
            inputs.data.orderId &&
            Number.parseInt(inputs.data.orderId)) ||
          null,
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
    } catch (error) {
      sails.log.error(error);
      sails.log.error(`Error whilst creating Notification object in send-sms-notification handler`);
    }

    var dontActuallySend =
      sails.config.environment === 'test' ||
      process.env.NODE_ENV !== 'production' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST ||
      inputs.to ===
        `${sails.config.custom.testPhoneNumberCountryCode}${sails.config.custom.testPhoneNumber}`;
      
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.sendSmsNotification will not send notifications.
      Message would have been send to ${inputs.to} with body: ${inputs.body}`);
      return exits.success({
        notification: newNotification,
      });
    }

    if(sails.config.custom.plivoAuthId && sails.config.custom.plivoAuthToken){
      const plivoClient = new plivo.Client(
        sails.config.custom.plivoAuthId,
        sails.config.custom.plivoAuthToken
      );

      try {
        await plivoClient.messages
          .create({
            text: inputs.body,
            src: 'vegi',
            dst: inputs.to, // phone numbers in E.164 format (for example, +12025551234)
          }).then((response) => {
            sails.log.info(`Plivo SMS Client [to:${inputs.to}] -> ${response}`);
            return response;
          });
      } catch (err) {
        sails.log.error(err.message);
      }
    } else if(sails.config.custom.twilioSID && sails.config.custom.twilioAuthToken){
      const twilioClient = new twilio(
        sails.config.custom.twilioSID,
        sails.config.custom.twilioAuthToken
      );

      await twilioClient.messages
        .create({
          body: inputs.body,
          to: inputs.to,
          from: 'vegi',
        })
        .then((message) => {
          return message.sid;
        })
        .catch((err) => {
          throw new Error(err.message);
        });
    } else {
      sails.log.warn('SMS Helper has no client libraries with secrets configured to send SMS messages');
    }

    return exits.success({
      notification: newNotification
    });
  },
};

