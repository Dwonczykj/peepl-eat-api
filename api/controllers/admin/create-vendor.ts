declare var sails: any;
declare var Vendor: any;

module.exports = {

  friendlyName: 'Create vendor',

  description: '',

  files: ['image'],

  inputs: {
    name: {
      type: 'string',
      required: true,
      maxLength: 50
    },
    description: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      isIn: ['restaurant', 'shop'],
      required: true
    },
    image:{
      type: 'ref',
      required: true
    },
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/
    },
    phoneNumber: {
      type: 'string',
    },
    // deliveryRestrictionDetails: {
    //   type: 'string'
    // },
    status: {
      type: 'string',
      isIn: ['draft', 'active', 'inactive']
    },
    costLevel: {
      type: 'number',
      min: 1,
      max: 3
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly created `Vendor`s ID.',
      outputExample: {}
    },
    noFileAttached: {
      description: 'No file was attached.',
      responseType: 'badRequest'
    },
    tooBig: {
      description: 'The file is too big.',
      responseType: 'badRequest'
    },
  },

  fn: async function (inputs, exits) {
    var imageInfo = await sails.uploadOne(inputs.image, {
      adapter: require('skipper-s3'),
      key: sails.config.custom.amazonS3AccessKey,
      secret: sails.config.custom.amazonS3Secret,
      bucket: sails.config.custom.amazonS3Bucket,
      maxBytes: 30000000
    })
    .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
    .intercept((err) => new Error('The photo upload failed! ' + err.message));

    if(!imageInfo) {
      return exits.noFileAttached();
    }

    var newVendor = await Vendor.create({
      imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      name: inputs.name,
      description: inputs.description,
      phoneNumber: inputs.phoneNumber,
      type: inputs.type,
      walletAddress: inputs.walletAddress,
      // deliveryRestrictionDetails: inputs.deliveryRestrictionDetails
    }).fetch();

    // All done.
    return exits.success({
      id: newVendor.id
    });

  }

};
