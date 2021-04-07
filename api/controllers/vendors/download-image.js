/* declare var Vendor: any;
declare var sails: any; */
module.exports = {

  friendlyName: 'Download image',

  description: 'Download image file (returning a stream).',

  inputs: {
    vendorid: {
      type: 'number',
      required: true
    }
  },

  exits: {

  },

  fn: async function (inputs) {

    var vendor = await Vendor.findOne(inputs.vendorid);

    if(vendor.imageFd) {
      this.res.type(vendor.imageMime);
      var downloading = await sails.startDownload(vendor.imageFd);

      // All done.
      return downloading;
    }

    return;

  }

};
