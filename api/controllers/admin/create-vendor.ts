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
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/
    },
    phoneNumber: {
      type: 'string',
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
    pickupAddressLatitude: {
      type: 'number',
      allowNull: true,
    },
    pickupAddressLongitude: {
      type: 'number',
      allowNull: true,
    },
    // deliveryRestrictionDetails: {
    //   type: 'string'
    // },
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
      max: 3
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5
    },
    isVegan: {
      type: 'boolean',
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
    badGeoCoordinate: {
      description: 'Vendor address geocoordinates are out of bounds',
      statusCode: 403,
      responseType: 'badRequest',
      latitudeAboveBounds: null,
      longitudeAboveBounds: null
    },
  },

  fn: async function (inputs, exits) {
    // Fix errors to do with strings as association IDs
    if(inputs.deliveryPartner && inputs.deliveryPartner === 'null') {
      inputs.deliveryPartner = null;
    }

    var imageInfo = await sails
      .uploadOne(inputs.image, {
        adapter: require("skipper-s3"),
        key: sails.config.custom.amazonS3AccessKey,
        secret: sails.config.custom.amazonS3Secret,
        bucket: sails.config.custom.amazonS3Bucket,
        maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
      })
      .intercept("E_EXCEEDS_UPLOAD_LIMIT", "tooBig")
      .intercept((err) => new Error("The photo upload failed! " + err.message));

    if(!imageInfo) {
      sails.log('no image file attached to create-vendor call');
      return exits.noFileAttached();
    }

    if(inputs.pickupAddressLatitude > 180 || inputs.pickupAddressLatitude < -180){
      return exits.badGeoCoordinate({latitudeAboveBounds: (inputs.pickupAddressLatitude > 180)});
    }
    if(inputs.pickupAddressLongitude > 180 || inputs.pickupAddressLongitude < -180){
      return exits.badGeoCoordinate({longitudeAboveBounds: (inputs.pickupAddressLongitude > 180)});
    } // TODO: How to return bad formdata to page via exits action sails?

    //TODO: Validate the address input and use google maps service to validate the postcode using google services
    var newVendor = await Vendor.create({
      imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      name: inputs.name,
      description: inputs.description,
      phoneNumber: inputs.phoneNumber,
      pickupAddressLineOne: inputs.pickupAddressLineOne,
      pickupAddressLineTwo: inputs.pickupAddressLineTwo,
      pickupAddressCity: inputs.pickupAddressCity,
      pickupAddressPostCode: inputs.pickupAddressPostCode.toLocaleUpperCase(),
      pickupAddressLatitude: inputs.pickupAddressLatitude,
      pickupAddressLongitude: inputs.pickupAddressLongitude,
      type: inputs.type,
      walletAddress: inputs.walletAddress,
      isVegan: inputs.isVegan,
      deliveryPartner: inputs.deliveryPartner,
    }).fetch();

    // All done.
    return exits.success({
      id: newVendor.id
    });

  }

};
