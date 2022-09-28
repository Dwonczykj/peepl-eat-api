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
    },
    isFeatured: {
      type: 'boolean'
    },
    category: {
      type: 'string',
      required: true,
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly updated `Product`.',
      outputExample: {
        id: 'old_product_id'
      }
    },
    notFound: {
      description: 'There is no product with that ID!',
      responseType: 'notFound'
    },
  },

  fn: async function (inputs, exits) {

    let product = await Product.findOne({ id: inputs.id });

    if (!product) {
      return exits.notFound();
    }

    // Check if user is authorised to edit product.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: product.vendor
    });

    if (!isAuthorisedForVendor) {
      return exits.error(new Error('You are not authorised to edit this product.'));
    }

    if(inputs.image){
      var imageInfo = await sails.uploadOne(inputs.image, {
        adapter: require('skipper-s3'),
        key: sails.config.custom.amazonS3AccessKey,
        secret: sails.config.custom.amazonS3Secret,
        bucket: sails.config.custom.amazonS3Bucket,
        maxBytes: 30000000
      })
      .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
      .intercept((err) => new Error('The photo upload failed! ' + err.message));

      if(imageInfo) {
        inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
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
