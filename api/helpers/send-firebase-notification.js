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


  fn: async function (inputs) {

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

  }


};

