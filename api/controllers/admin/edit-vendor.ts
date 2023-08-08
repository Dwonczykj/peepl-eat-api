import { sailsModelKVP, SailsModelType, sailsVegi } from "../../../api/interfaces/iSails";
import { AddressType, PostCodeString, StatusLiteral } from "../../../scripts/utils";
declare var sails: sailsVegi;

declare var Address: SailsModelType<AddressType>;

export type EditVendorInputs = {
  id: number;
  name: string;
  description: string;
  image: any;
  walletAddress: string;
  phoneNumber?: string | null;
  // pickupAddressLineOne?: string | null;
  // pickupAddressLineTwo?: string | null;
  // pickupAddressCity?: string | null;
  // pickupAddressPostCode?: string | null;
  // pickupAddressLatitude?: number | null;
  // pickupAddressLongitude?: number | null;
  pickupAddress?: AddressType,
  status: StatusLiteral;
  deliveryPartner?: string |null;
  costLevel: number | null;
  rating: number | null;
  isVegan: boolean;
  minimumOrderAmount: number;
}

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
    pickupAddress: {
      type: 'ref',
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

  fn: async function (inputs: EditVendorInputs & {
    imageUrl?: string;
  }, exits) {
    // Fix errors to do with strings as association IDs
    if(inputs.deliveryPartner && inputs.deliveryPartner === 'null') {
      inputs.deliveryPartner = null;
    }

    let vendor = await Vendor.findOne({ id: inputs.id });

    if (!vendor) {
      return exits.notFound();
    }

    // Check if user is authorised to edit vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: vendor.id
    });

    if (!isAuthorisedForVendor) {
      return exits.unauthorised();
    }

    let coordinates = {
      lat: 0, //inputs.pickupAddressLatitude,
      lng: 0, //inputs.pickupAddressLongitude,
    };

    if (
      inputs.pickupAddress &&
      inputs.pickupAddress.addressLineOne &&
      inputs.pickupAddress.addressPostCode
    ) {
      try {
	      const _coordinates = await sails.helpers.getCoordinatesForAddress.with({
	        addressLineOne: inputs.pickupAddress.addressLineOne,
	        addressLineTwo: inputs.pickupAddress.addressLineTwo,
	        addressTownCity: inputs.pickupAddress.addressTownCity,
	        addressPostCode: inputs.pickupAddress.addressPostCode,
	        addressCountryCode: 'UK',
	      });
	      if (_coordinates) {
	        coordinates = _coordinates;
	      }
      } catch (error) {
        sails.log.error(`${error}`);
      }
    }

    let existingAddress = await Address.findOne({
      vendor: inputs.id,
    });
    let newAddress: AddressType | sailsModelKVP<AddressType>;
    if (!existingAddress) {
      if (
        !inputs.pickupAddress.addressLineOne ||
        !inputs.pickupAddress.addressTownCity ||
        !inputs.pickupAddress.addressPostCode
      ){
        return exits.badPostalCode();
      }
      newAddress = await Address.create({
        vendor: inputs.id,
        label: 'Store',
        addressLineOne: inputs.pickupAddress.addressLineOne,
        addressLineTwo: inputs.pickupAddress.addressLineTwo,
        addressTownCity: inputs.pickupAddress.addressTownCity,
        addressPostCode: inputs.pickupAddress.addressPostCode,
        addressCountryCode: 'UK',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      }).fetch();
    } else {
      await Address.update(existingAddress.id).set({
        vendor: inputs.id,
        label: 'Store',
        addressLineOne: inputs.pickupAddress.addressLineOne,
        addressLineTwo: inputs.pickupAddress.addressLineTwo,
        addressTownCity: inputs.pickupAddress.addressTownCity,
        addressPostCode: inputs.pickupAddress.addressPostCode,
        addressCountryCode: 'UK',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
      newAddress = await Address.findOne(existingAddress.id);
    }

    if(inputs.image /*&& sails.config.custom.amazonS3Secret && sails.config.custom.amazonS3AccessKey*/){
      let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if(imageInfo) {
        inputs.imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
      delete inputs.image;
    }

    // else {
    //   delete inputs.image;
    //   inputs.imageUrl = vendor.imageUrl;
    // }

    if(inputs.pickupAddress.addressPostCode){
      inputs.pickupAddress.addressPostCode =
        (inputs.pickupAddress.addressPostCode.toLocaleUpperCase() as PostCodeString);
    }
    var regPostcode = /^([a-zA-Z]){1}([0-9][0-9]|[0-9]|[a-zA-Z][0-9][a-zA-Z]|[a-zA-Z][0-9][0-9]|[a-zA-Z][0-9]){1}([ ])([0-9][a-zA-z][a-zA-z]){1}$/;
    //TODO: Validate the address input and use google maps service to validate the postcode using google services
    if (
      !inputs.pickupAddress.addressPostCode ||
      !inputs.pickupAddress.addressPostCode.match(regPostcode)
    ) {
      return exits.badPostalCode();
    }

    try {
      const updateVendor = {
        ...inputs,
        pickupAddress: newAddress.id,
      };
	    var newVendor = await Vendor.updateOne(inputs.id).set(updateVendor);
      return exits.success({
        id: newVendor.id,
      });
    } catch (error) {
      sails.log.error(`Error editting vendor: ${error}`);
      return exits.notFound();
    }
    
  }


};
