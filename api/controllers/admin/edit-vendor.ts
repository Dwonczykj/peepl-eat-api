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
      required: true,
      maxLength: 50
    },
    description: {
      type: 'string',
      required: true
    },
    image:{
      type: 'ref',
    },
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/
    },
    phoneNumber: {
      type: 'string',
      allowNull: true
    },
    deliveryRestrictionDetails: {
      type: 'string',
      allowNull: true
    },
    status: {
      type: 'string',
      isIn: ['draft', 'active', 'inactive']
    },
    costLevel: {
      type: 'number',
      min: 1,
      max: 3,
      allowNull: true
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5,
      allowNull: true
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
    notFound: {
      description: 'There is no vendor with that ID!',
      responseType: 'notFound'
    },
    unauthorised: {
      description: 'You are not authorised to edit this vendor.',
      responseType: 'unauthorised'
    },
    tooBig: {
      description: 'The file attached is too big.',
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs) {
    let vendor = await Vendor.findOne({ id: inputs.id });

    if (!vendor) {
      throw 'notFound';
    }

    // Check if user is authorised to edit vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: vendor.id
    });

    if (!isAuthorisedForVendor) {
      throw 'unauthorised';
    }

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

    var newVendor = await Vendor.updateOne(inputs.id).set(inputs);

    // All done.
    return {
      id: newVendor.id
    };
  }


};
