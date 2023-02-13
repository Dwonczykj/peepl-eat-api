const util = require('util');
module.exports = {
  friendlyName: 'Create delivery partner',

  description: '',

  files: ['image'],

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'The name of the delivery partner',
      maxLength: 50,
    },
    email: {
      type: 'string',
      required: true,
      description: 'The email address of the delivery partner',
      maxLength: 50,
      isEmail: true,
    },
    phoneNumber: {
      type: 'string',
      required: true,
      description: 'The phone number of the delivery partner',
      maxLength: 20,
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'inactive',
    },
    type: {
      type: 'string',
      isIn: ['bike', 'electric'],
      defaultsTo: 'bike',
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5,
      defaultsTo: 5,
    },
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
    image: {
      type: 'ref',
    },
  },

  exits: {
    success: {
      description: 'New delivery partner created.',
    },
    successJSON: {
      statusCode: 200,
    },
    alreadyExists: {
      description: 'delivery partner already exists',
      statusCode: 400,
    },
  },

  fn: async function (inputs, exits) {
    var exist = await DeliveryPartner.find({
      or: [
        {
          email: inputs.email,
        },
        {
          name: inputs.name,
        },
      ],
    });

    if (exist && exist.length > 0) {
      sails.log(
        `DeliveryPartner: ${util.inspect(exist[0], {
          depth: null,
        })} already exists.`
      );
      return exits.alreadyExists();
    }

    inputs.imageUrl = '';

    //Dont check for inputs.image as imageUrl is required on DeliveryPartner model
    let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
    if (imageInfo) {
      inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
    }

    // Create a new delivery partner
    var newDeliveryPartner = await DeliveryPartner.create({
      name: inputs.name,
      email: inputs.email,
      phoneNumber: inputs.phoneNumber,
      status: inputs.status,
      walletAddress: inputs.walletAddress,
      rating: inputs.rating,
      type: inputs.type,
      imageUrl: inputs.imageUrl,
    }).fetch();

    // Return the new delivery partner
    // return exits.success(newDeliveryPartner);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ newDeliveryPartner });
    } else {
      return exits.success({ newDeliveryPartner });
    }
  },
};
