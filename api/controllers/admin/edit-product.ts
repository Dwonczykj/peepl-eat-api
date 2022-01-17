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
      maxLength: 50
    },
    description: {
      type: 'string',
    },
    basePrice: {
      type: 'number',
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
    notFound: {
      description: 'There is no product with that ID!',
      responseType: 'notFound'
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

    if(!newProduct) {
      return exits.notFound({message: 'There is no product with that ID!'});
    }

    // All done.
    return exits.success({
      id: newProduct.id
    });
  }


};
