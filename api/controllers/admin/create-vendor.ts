declare var sails: any;
declare var Vendor: any;

module.exports = {

  friendlyName: 'Create vendor',

  description: '',

  files: ['image'],

  inputs: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: true
    },
    image:{
      type: 'ref',
      required: true
    },
    walletId: {
      type: 'string',
      required: true
    }
  },

  exits: {

  },

  fn: async function (inputs, exits) {
    var imageInfo = await sails.uploadOne(inputs.image, {
      maxBytes: 30000000
    });
    // TODO: Handle missing image

    var newVendor = await Vendor.create({
      imageFd: imageInfo.fd,
      imageMime: imageInfo.type,
      name: inputs.name,
      description: inputs.description,
      type: inputs.type,
      walletId: inputs.walletId
    }).fetch();

    // All done.
    return exits.success({
      id: newVendor.id
    });

  }

};
