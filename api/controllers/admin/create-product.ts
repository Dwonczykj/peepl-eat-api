declare var sails: any;
declare var Product: any;
import {v4 as uuidv4} from 'uuid';

module.exports = {
  friendlyName: 'Create product',

  description: '',

  files: ['image'],

  inputs: {
    name: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    description: {
      type: 'string',
      required: true,
    },
    basePrice: {
      type: 'number',
      required: true,
    },
    image: {
      type: 'ref',
    },
    isAvailable: {
      type: 'boolean',
    },
    priority: {
      type: 'number',
    },
    isFeatured: {
      type: 'boolean',
    },
    vendor: {
      type: 'number',
      required: true,
    },
    category: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    success: {
      outputDescription: 'The newly created `Product`s ID.',
      outputExample: {},
    },
    noFileAttached: {
      description: 'No file was attached.',
      responseType: 'badRequest',
    },
    tooBig: {
      description: 'The file is too big.',
      responseType: 'badRequest',
    },
  },

  fn: async function (inputs, exits) {
    // Check that user is authorised to modify products for this vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: inputs.vendor,
    });

    if (!isAuthorisedForVendor) {
      return exits.error(
        new Error('You are not authorised to create products for this vendor.')
      );
    }

    var newProduct;

    let imageInfo = null;
    // if (inputs.image){
    //   imageInfo = await sails.helpers.uploadOneS3(inputs.image);
    // }
    const skipperUpstream = this.req.file('image');

    // skipperUpstream._files is an internal array containing the uploaded files for key `image`
    // here i just expecting a single file, or none
    const file = skipperUpstream._files[0];

    if (!file) {
      // `skipperUpstream.__proto__` is `Upstream`. It provides `noMoreFiles()` to stop receiving files.
      // It also clears all timeouts: https://npmdoc.github.io/node-npmdoc-skipper/build/apidoc.html#apidoc.element.skipper.Upstream.prototype.noMoreFiles
      skipperUpstream.noMoreFiles();
      // return;
    }
    
    if (inputs.image && inputs.image._files && inputs.image._files.length) {
      imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if (imageInfo) {
        inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
    } else if (inputs.imageUrl) {
      imageInfo = await sails.helpers.uploadOneS3(inputs.imageUrl);
      if (imageInfo) {
        inputs.imageUrl = imageInfo.ffd;
      }
    }

    delete inputs.image;


    if (!imageInfo) {
      // Create the new product
      newProduct = await Product.create({
        name: inputs.name,
        description: inputs.description,
        basePrice: inputs.basePrice,
        isAvailable: inputs.isAvailable,
        priority: inputs.priority,
        vendor: inputs.vendor,
        category: inputs.category,
      }).fetch();
    } else {
      newProduct = await Product.create({
        imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
        name: inputs.name,
        description: inputs.description,
        basePrice: inputs.basePrice,
        isAvailable: inputs.isAvailable,
        priority: inputs.priority,
        vendor: inputs.vendor,
        category: inputs.category,
      }).fetch();
    }

    // All done.
    return exits.success({
      id: newProduct.id,
    });

    // // Check that user is authorised to modify products for this vendor.
    // var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
    //   userId: this.req.session.userId,
    //   vendorId: inputs.vendor,
    // });

    // if (!isAuthorisedForVendor) {
    //   return exits.error(
    //     new Error("You are not authorised to create products for this vendor.")
    //   );
    // }

    // const original = inputs.image; //TODO: Test that inputs.image isn't already a stream

    // var newProduct;
    // if (!original){
    //   newProduct = await Product.create({
    //     imageUrl: '',
    //     name: inputs.name,
    //     description: inputs.description,
    //     basePrice: inputs.basePrice,
    //     isAvailable: inputs.isAvailable,
    //     isFeatured: inputs.isFeatured,
    //     priority: inputs.priority,
    //     vendor: inputs.vendor,
    //     category: inputs.category,
    //   }).fetch();
    //   exits.success({
    //     id: newProduct.id,
    //   });
    //   return;
    // }

    // sails.log('creating a product with image set using sharp');
    // var AWS = require("aws-sdk");
    // // const { S3Client, AbortMultipartUploadCommand } = require('@aws-sdk/client-s3');
    // const sharp = require("sharp");

    // var fs = require("fs");
    // // https://stackoverflow.com/a/32561731
    // return sharp(original)
    //   .resize(800)
    //   .quality(90)
    //   .toBuffer((err, outputBuffer) => {
    //     if (err) {
    //       return new Error("The image compression failed! " + err.message);
    //     } else {
    //       const s3client = new AWS.S3({
    //         accessKeyId: sails.config.custom.amazonS3AccessKey,
    //         secretAccessKey: sails.config.custom.amazonS3Secret,
    //         params: {
    //           Bucket: sails.config.custom.amazonS3Bucket,
    //           Key: `${inputs.name}_vendor${inputs.vendor}`,
    //         },
    //       });

    //       s3client.upload(
    //         { ACL: "public-read", Body: outputBuffer },
    //         async (err, result) => {

    //           if (err || !result) {
    //             //handle error
    //             newProduct = await Product.create({
    //               name: inputs.name,
    //               description: inputs.description,
    //               basePrice: inputs.basePrice,
    //               isAvailable: inputs.isAvailable,
    //               isFeatured: inputs.isFeatured,
    //               priority: inputs.priority,
    //               vendor: inputs.vendor,
    //               category: inputs.category,
    //             }).fetch();
    //           } else {
    //             // continue, handle returned data
    //             fs.unlinkSync(original); // delete original

    //             // Create the new product
    //             newProduct = await Product.create({
    //               imageUrl: sails.config.custom.amazonS3BucketUrl + result.fd,
    //               name: inputs.name,
    //               description: inputs.description,
    //               basePrice: inputs.basePrice,
    //               isAvailable: inputs.isAvailable,
    //               isFeatured: inputs.isFeatured,
    //               priority: inputs.priority,
    //               vendor: inputs.vendor,
    //               category: inputs.category,
    //             }).fetch();
    //           }
    //           return exits.success({
    //             id: newProduct.id,
    //           });
    //         }
    //       );
    //     }
    //   });
  },
};
