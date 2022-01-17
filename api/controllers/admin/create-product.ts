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
    var imageInfo = await sails.uploadOne(inputs.image, {
      maxBytes: 30000000
    })
    .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
    .intercept((err) => new Error('The photo upload failed! ' + err.message));

    if(!imageInfo) {
      return exits.noFileAttached();
    }

    var newProduct = await Product.create({
      imageFd: imageInfo.fd,
      imageMime: imageInfo.type,
      name: inputs.name,
      description: inputs.description,
      basePrice: inputs.basePrice,
      isAvailable: inputs.isAvailable,
      priority: inputs.priority,
      vendor: inputs.vendor
    }).fetch()
    .catch((err) => {
      console.log(err);
    });

    // All done.
    return exits.success({
      id: newProduct.id
    });

  }

};
