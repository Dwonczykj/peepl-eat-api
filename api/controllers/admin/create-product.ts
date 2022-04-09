declare var sails: any;
declare var Product: any;

module.exports = {

  friendlyName: 'Create product',

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
    basePrice: {
      type: 'number',
      required: true
    },
    image: {
      type: 'ref',
      required: true
    },
    isAvailable: {
      type: 'boolean'
    },
    priority: {
      type: 'number'
    },
    vendor: {
      type: 'number'
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
    // Check that user is authorised to modify products for this vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: inputs.vendor
    });

    if(!isAuthorisedForVendor) {
      return exits.error(new Error('You are not authorised to create products for this vendor.'));
    }

    // Check that the file is not too big.
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

    // Create the new product
    var newProduct = await Product.create({
      imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      name: inputs.name,
      description: inputs.description,
      basePrice: inputs.basePrice,
      isAvailable: inputs.isAvailable,
      priority: inputs.priority,
      vendor: inputs.vendor
    }).fetch();

    // All done.
    return exits.success({
      id: newProduct.id
    });

  }

};
