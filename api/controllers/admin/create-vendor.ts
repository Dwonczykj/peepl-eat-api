declare var sails: any;
declare var Vendor: any;

module.exports = {

  friendlyName: 'Create vendor',

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
    type: {
      type: 'string',
      isIn: ['restaurant', 'shop'],
      required: true
    },
    image:{
      type: 'ref',
      required: true
    },
    walletId: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/
    },
    phoneNumber: {
      type: 'string',
    },
    deliveryRestrictionDetails: {
      type: 'string'
    },
    status: {
      type: 'string',
      isIn: ['draft', 'active', 'inactive']
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
    // TODO: Handle missing image

    if(!imageInfo) {
      return exits.noFileAttached();
    }

    var newVendor = await Vendor.create({
      imageFd: imageInfo.fd,
      imageMime: imageInfo.type,
      name: inputs.name,
      description: inputs.description,
      type: inputs.type,
      walletId: inputs.walletId,
      deliveryRestrictionDetails: inputs.deliveryRestrictionDetails
    }).fetch();

    // All done.
    return exits.success({
      id: newVendor.id
    });

  }

};
