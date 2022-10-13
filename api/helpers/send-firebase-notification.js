// * Moved to api/policies/firebase.js
// var admin = require('firebase-admin');
// var serviceAccount = require('../../config/vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

module.exports = {


  friendlyName: 'Send firebase notification',


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
    var dontActuallySend =
      sails.config.environment === "test" ||
      process.env.FIREBASE_AUTH_EMULATOR_HOST;
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
    const admin = this.req.firebase;
    admin.messaging()
      .sendToTopic(inputs.topic, message)
      .then((res) => {
        return res;
      }).catch((err) => {
        sails.log.warn(err);
        throw new Error(err);
      });
    return exits.success();

  }


};

