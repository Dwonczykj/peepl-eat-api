/* declare var Vendor: any;
declare var sails: any; */
module.exports = {

  friendlyName: 'Download image',

  description: 'Download image file (returning a stream).',

  inputs: {
    productId: {
      type: 'number',
      required: true
    }
  },

  exits: {

  },

  fn: async function (inputs) {

    var product = await Product.findOne(inputs.productId);

    if(product.imageFd) {
      this.res.type(product.imageMime);
      var downloading = await sails.startDownload(product.imageFd);

      // All done.
      return downloading;
    }

    return;

  }

};
