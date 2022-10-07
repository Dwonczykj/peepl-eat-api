module.exports = {

  friendlyName: 'Send to logistics',

  description: 'Send the order to the logistics server (currently Coopcycle)',

  inputs: {
    pickupAddressLineOne: {
      type: 'string'
    },
    pickupAddressLineTwo: {
      type: 'string'
    },
    pickupAddressCity: {
      type: 'string'
    },
    pickupAddressPostCode: {
      type: 'string'
    },
    deliveryContactName: {
      type: 'string'
    },
    deliveryPhoneNumber: {
      type: 'string'
    },
    deliveryComments: {
      type: 'string'
    },
    deliveryAddressLineOne: {
      type: 'string'
    },
    deliveryAddressLineTwo: {
      type: 'string'
    },
    deliveryAddressCity: {
      type: 'string'
    },
    deliveryAddressPostCode: {
      type: 'string'
    },
    deliverBefore: {
      type: 'number'
    },
    deliverAfter: {
      type: 'number'
    }
  },


  exits: {
    success: {
      description: 'All done.',
    },
  },


  fn: async function (inputs, exits) {
    var axios = require('axios');
    var moment = require('moment');

    // TODO: Better management of Coopcycle JWT (move to DB and refresh after expiry?)
    var jwtRequest = await axios({
      method: 'post',
      url: sails.config.custom.coopcycleUrl + '/oauth2/token',
      auth: {
        username: 'b8836e8d6ebb19ef277f02da9ec32e58',
        password: '191f1c9a6593b48b166ae089b661237d3c7137d722edf41aecb070a9b7a6b8a6b73151a8336574440d683c2406f2d9ad7d50951bc9da0c742f17c59ac720b2e8'
      },
      data: {
        'grant_type': 'client_credentials',
        'scope': 'deliveries'
      }
    })
    .catch((err)=> {
      sails.log.warn(err);
    });

    // Create HTTP client with new access token
    var client = axios.create({
      baseURL: sails.config.custom.coopcycleUrl,
      timeout: 5000,
      headers: {'Authorization': 'Bearer ' + jwtRequest.data.access_token, 'Content-Type': 'application/ld+json'}
    });

    // TODO: Work out the best way to send dates and times.
    var deliverBefore = moment.unix(inputs.deliverBefore).calendar();
    var deliverAfter = moment.unix(inputs.deliverAfter).calendar();

    var requestBody = {
      pickup: {
        address: {
          streetAddress: `${inputs.pickupAddressLineOne}, ${inputs.pickupAddressLineTwo}, ${inputs.pickupAddressCity}, ${inputs.pickupAddressPostCode}`,
        },
      },
      dropoff: {
        address: {
          contactName: inputs.deliveryContactName,
          telephone: inputs.deliveryPhoneNumber,
          comments: inputs.deliveryComments,
          streetAddress: `${inputs.deliveryAddressLineOne}, ${inputs.deliveryAddressLineTwo}, ${inputs.deliveryAddressCity}, ${inputs.deliveryAddressPostCode}`
        },
        before: deliverBefore,
        after: deliverAfter
      }
    };

    // Send the delivery information to Coopcycle
    var response = await client.post('/api/deliveries', requestBody)
    .catch((err) => {
      sails.log.info('Error creating the delivery.');
      sails.log.warn(err);
    });

    return {id: response.data.id};
  }
};
