var admin = require('firebase-admin');
var serviceAccount = require('../../config/vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = {


  friendlyName: 'Send firebase notification',


  description: '',


  inputs: {
    topic: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string'
    },
    body: {
      type: 'string'
    },
    data: {
      type: 'ref'
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

    admin.messaging()
    .sendToTopic(inputs.topic, message)
    .then((res)=> {
      sails.log(res);
      return res;
    }).catch((err)=> {
      sails.log(err);
    });

  }


};

