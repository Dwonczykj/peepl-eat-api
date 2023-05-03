var admin = require('firebase-admin');

module.exports = {


  friendlyName: 'Broadcast firebase notification for a topic name',


  description: '',


  inputs: {
    topic: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string',
      required: true
    },
    body: {
      type: 'string',
      defaultsTo: ''
    },
    data: {
      type: 'ref',
      defaultsTo: {}
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {

    const newNotification = await Notification.create({
      recipient: inputs.topic,
      type: 'push',
      sentAt: Date.now(),
      title: inputs.title,
      order: inputs.data && inputs.data.orderId || null,
      metadata:
        JSON.stringify(inputs.data && inputs.data.orderId
          ? {
            model: 'order',
            id: inputs.data.orderId,
            broadcast: true,
          }
          : {
            model: '',
            id: null,
            broadcast: true,
          }),
    }).fetch();

    var dontActuallySend =
      sails.config.environment === 'test' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST;
    if (dontActuallySend) {
      sails.log
        .info(`Running sails in test mode, helpers.sendFirebaseNotification will not send notifications.
      Message would have been sent for firebase topic id: ${inputs.topic} with title ${inputs.title} with body: ${inputs.body}`);
      return exits.success();
    }

    const message = {
      data: inputs.data,
      notification:{
        title: inputs.title,
        body: inputs.body
      }
    };
    // const admin = this.req.firebase;
    admin.messaging()
      .sendToTopic(inputs.topic, message)
      .then((res) => {
        return res;
      }).catch((err) => {
        sails.log.warn(err);
        throw new Error(err);
      });
    return exits.success({ notification: newNotification });
  }


};

