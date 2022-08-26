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
    vendor: {
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      outputDescription: 'The newly created `Product`s ID.',
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

    var AWS = require('aws-sdk');
    // const { S3Client, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3');
    const sharp = require('sharp');

    var fs = require('fs');

    const original = inputs.image; //TODO: Test that inputs.image isn't already a stream

    // https://stackoverflow.com/a/32561731
    return sharp(original).resize(800).quality(90).toBuffer((err, outputBuffer) => {
      if (err) {
        return new Error('The image compression failed! ' + err.message);
      } else {
        const s3client = new AWS.S3({
          accessKeyId: sails.config.custom.amazonS3AccessKey,
          secretAccessKey: sails.config.custom.amazonS3Secret,
          params : {
            Bucket : sails.config.custom.amazonS3Bucket,
            Key: `${inputs.name}_vendor${inputs.vendor}`
          }
        });

        s3client.upload({ACL:'public-read', Body: outputBuffer}, async (err, result) => {
          var newProduct;
          if(err || !result) {
            //handle error
            newProduct = await Product.create({
              name: inputs.name,
              description: inputs.description,
              basePrice: inputs.basePrice,
              isAvailable: inputs.isAvailable,
              priority: inputs.priority,
              vendor: inputs.vendor
            }).fetch();
            
          } else {
            // continue, handle returned data
            fs.unlinkSync(original); // delete original
            
            // Create the new product
            newProduct = await Product.create({
              imageUrl: sails.config.custom.amazonS3BucketUrl + result.fd,
              name: inputs.name,
              description: inputs.description,
              basePrice: inputs.basePrice,
              isAvailable: inputs.isAvailable,
              priority: inputs.priority,
              vendor: inputs.vendor
            }).fetch();
          }
          return exits.success({
            id: newProduct.id
          });
        });
      }
    });
    // var newProduct;

    // // Check that the file is not too big.
    // var imageInfo = await sails.uploadOne(inputs.image, {
    //   adapter: require('skipper-s3'),
    //   key: sails.config.custom.amazonS3AccessKey,
    //   secret: sails.config.custom.amazonS3Secret,
    //   bucket: sails.config.custom.amazonS3Bucket,
    //   maxBytes: 30000000
    // })
    // .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
    // .intercept((err) => new Error('The photo upload failed! ' + err.message));

    // if(!imageInfo) {
    //   // Create the new product
    //   newProduct = await Product.create({
    //     name: inputs.name,
    //     description: inputs.description,
    //     basePrice: inputs.basePrice,
    //     isAvailable: inputs.isAvailable,
    //     priority: inputs.priority,
    //     vendor: inputs.vendor
    //   }).fetch();
    // } else {
    //   newProduct = await Product.create({
    //     imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
    //     name: inputs.name,
    //     description: inputs.description,
    //     basePrice: inputs.basePrice,
    //     isAvailable: inputs.isAvailable,
    //     priority: inputs.priority,
    //     vendor: inputs.vendor
    //   }).fetch();
    // }

    // All done.
    // return exits.success({
    //   id: newProduct.id
    // });

    // Check that the file is not too big.
    // var imageInfo = await sails.uploadOne(inputs.image, {
    //   adapter: require('skipper-s3'),
    //   key: sails.config.custom.amazonS3AccessKey,
    //   secret: sails.config.custom.amazonS3Secret,
    //   bucket: sails.config.custom.amazonS3Bucket,
    //   maxBytes: 30000000
    // })
    // .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
    // .intercept((err) => new Error('The photo upload failed! ' + err.message));

    // if(!imageInfo) {
    //   return exits.noFileAttached();
    // }

    // // Create the new product
    // var newProduct = await Product.create({
    //   imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
    //   name: inputs.name,
    //   description: inputs.description,
    //   basePrice: inputs.basePrice,
    //   isAvailable: inputs.isAvailable,
    //   priority: inputs.priority,
    //   vendor: inputs.vendor
    // }).fetch();

    // // All done.
    // return exits.success({
    //   id: newProduct.id
    // });

  }

};
