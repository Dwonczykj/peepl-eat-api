module.exports = {

  friendlyName: 'Edit product',

  description: '',

  files: ['image'],

  inputs: {
    id: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      required: true
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
    },
    isAvailable: {
      type: 'boolean'
    },
    priority: {
      type: 'number'
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly updated `Vendor`.',
      outputExample: {}
    },
    noFileAttached: {
      description: 'No file was attached.',
      responseType: 'badRequest'
    },
  },

  fn: async function (inputs, exits) {

    if(inputs.image){
      var imageInfo = await sails.uploadOne(inputs.image, {
        maxBytes: 30000000
      })
      .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
      .intercept((err) => new Error('The photo upload failed! ' + err.message));

      if(imageInfo) {
        inputs.imageFd = imageInfo.fd;
        inputs.imageMime = imageInfo.type;
      }
    }

    delete inputs.image;

    var newProduct = await Product.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: newProduct.id
    });
  }


};
