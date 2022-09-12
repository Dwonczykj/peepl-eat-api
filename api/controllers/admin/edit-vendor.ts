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
    pickupAddressLineOne: {
      type: 'string',
      allowNull: true
    },
    pickupAddressLineTwo: {
      type: 'string',
      allowNull: true
    },
    pickupAddressCity: {
      type: 'string',
      allowNull: true
    },
    pickupAddressPostCode: {
      type: 'string',
      allowNull: true
    },
    status: {
      type: 'string',
      isIn: ['draft', 'active', 'inactive']
    },
    deliveryPartner:{
      type: 'string',
      allowNull: true
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
    },
    isVegan: {
      type: 'boolean',
    },
    minimumOrderAmount: {
      type: 'number',
      min: 0,
      defaultsTo: 0
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
    badPostalCode: {
      description: 'Postal Code didnt match regex formatter in action',
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
    },
  },

  fn: async function (inputs, exits) {
    // Fix errors to do with strings as association IDs
    if(inputs.deliveryPartner && inputs.deliveryPartner === 'null') {
      inputs.deliveryPartner = null;
    }

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
      delete inputs.image;
    }

    if(inputs.pickupAddressPostCode){
      inputs.pickupAddressPostCode = inputs.pickupAddressPostCode.toLocaleUpperCase();
    }
    var regPostcode = '/^([a-zA-Z]){1}([0-9][0-9]|[0-9]|[a-zA-Z][0-9][a-zA-Z]|[a-zA-Z][0-9][0-9]|[a-zA-Z][0-9]){1}([ ])([0-9][a-zA-z][a-zA-z]){1}$/';
    //TODO: Validate the address input and use google maps service to validate the postcode using google services
    if (!inputs.pickupAddressPostCode || !inputs.pickupAddressPostCode.match(regPostcode))
    {
      return exits.badPostalCode();
    }

    var newVendor = await Vendor.updateOne(inputs.id).set(inputs);

    // All done.
    return {
      id: newVendor.id
    };
  }


};
