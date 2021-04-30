module.exports = {

  friendlyName: 'Edit vendor',

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
    image:{
      type: 'ref',
    },
    walletId: {
      type: 'string',
      required: true
    },
    phoneNumber: {
      type: 'string',
      allowNull: true
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

      if(!imageInfo) {
        return exits.noFileAttached();
      } else {
        inputs.imageFd = imageInfo.fd;
        inputs.imageMime = imageInfo.type;
      }
    }

    var newVendor = await Vendor.updateOne(inputs.id).set(inputs)
    .catch(() => {
      return exits.serverError();
    });

    // All done.
    return exits.success({
      id: newVendor.id
    });
  }


};
