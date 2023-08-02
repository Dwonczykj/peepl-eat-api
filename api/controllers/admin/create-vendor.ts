import { AddressType, StatusLiteral, VendorType } from '../../../scripts/utils';
import { SailsModelType } from '../../../api/interfaces/iSails';

declare var sails: any;
declare var Vendor: SailsModelType<VendorType>;
declare var Address: SailsModelType<AddressType>;

export type CreateVendorInputs = {
  name: string;
  description: string;
  type: 'restaurant' | 'shop';
  image: any;
  walletAddress: string;
  phoneNumber?: string | null;
  // pickupAddress.addressLineOne?: string | null;
  // pickupAddress.addressLineTwo?: string | null;
  // pickupAddress.addressTownCity?: string | null;
  // pickupAddress.addressPostCode?: string | null;
  // pickupAddress.latitude?: number | null;
  // pickupAddress.longitude?: number | null;
  pickupAddress: AddressType;
  status: StatusLiteral;
  deliveryPartner?: string | null;
  costLevel: number | null;
  rating: number | null;
  isVegan: boolean;
  minimumOrderAmount: number;
};

module.exports = {
  friendlyName: 'Create vendor',

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
    type: {
      type: 'string',
      isIn: ['restaurant', 'shop'],
      required: true,
    },
    image: {
      type: 'ref',
      required: true,
    },
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
    phoneNumber: {
      type: 'string',
    },
    // pickupAddress.addressLineOne: {
    //   type: 'string',
    //   allowNull: true,
    // },
    // pickupAddress.addressLineTwo: {
    //   type: 'string',
    //   allowNull: true,
    // },
    // pickupAddress.addressTownCity: {
    //   type: 'string',
    //   allowNull: true,
    // },
    // pickupAddress.addressPostCode: {
    //   type: 'string',
    //   allowNull: true,
    // },
    // pickupAddress.latitude: {
    //   type: 'number',
    //   allowNull: true,
    // },
    // pickupAddress.longitude: {
    //   type: 'number',
    //   allowNull: true,
    // },
    pickupAddress: {
      type: 'ref'
    },
    // deliveryRestrictionDetails: {
    //   type: 'string'
    // },
    status: {
      type: 'string',
      isIn: ['draft', 'active', 'inactive'],
    },
    deliveryPartner: {
      type: 'string',
      allowNull: true,
    },
    costLevel: {
      type: 'number',
      min: 1,
      max: 3,
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5,
    },
    isVegan: {
      type: 'boolean',
    },
    minimumOrderAmount: {
      type: 'number',
      min: 0,
      defaultsTo: 0,
    },
  },

  exits: {
    success: {
      outputDescription: 'The newly created `Vendor`s ID.',
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
    badGeoCoordinate: {
      description: 'Vendor address geocoordinates are out of bounds',
      statusCode: 403,
      responseType: 'badRequest',
      latitudeAboveBounds: null,
      longitudeAboveBounds: null,
    },
  },

  fn: async function (inputs: CreateVendorInputs, exits) {
    // Fix errors to do with strings as association IDs
    if (inputs.deliveryPartner && inputs.deliveryPartner === 'null') {
      inputs.deliveryPartner = null;
    }
    let imageInfo;
    if(inputs.image){
      imageInfo = await sails.helpers.uploadOneS3(inputs.image);
    }
    if (!imageInfo) {
      sails.log('no image file attached to create-vendor call');
      return exits.noFileAttached();
    }


    if (
      inputs.pickupAddress.latitude > 180 ||
      inputs.pickupAddress.latitude < -180
    ) {
      return exits.badGeoCoordinate({
        latitudeAboveBounds: inputs.pickupAddress.latitude > 180,
      });
    }
    if (
      inputs.pickupAddress.longitude > 180 ||
      inputs.pickupAddress.longitude < -180
    ) {
      return exits.badGeoCoordinate({
        longitudeAboveBounds: inputs.pickupAddress.longitude > 180,
      });
    }

    let coordinates = {
      lat: 0, //inputs.pickupAddressLatitude,
      lng: 0, //inputs.pickupAddressLongitude,
    };

    try {
      if (inputs.pickupAddress.addressLineOne && inputs.pickupAddress.addressPostCode) {
        const _coordinates = await sails.helpers.getCoordinatesForAddress.with({
          addressLineOne: inputs.pickupAddress.addressLineOne || '',
          addressLineTwo: inputs.pickupAddress.addressLineTwo || '',
          addressTownCity: inputs.pickupAddress.addressTownCity || '',
          addressPostCode: inputs.pickupAddress.addressPostCode || '',
          addressCountryCode: 'UK',
        });
        if(_coordinates){
          coordinates = {
            lat: _coordinates.lat,
            lng: _coordinates.lng,
          };
        }
      }
    } catch (err) {
      sails.log.error(
        `Failed to fetch coordinates of editted vendor pickup address: ${err}`
      );
    }

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
        sails.log.error(error);
      }
    }

    let newAddress = await Address.create({
      label: 'Store',
      addressLineOne: inputs.pickupAddress.addressLineOne,
      addressLineTwo: inputs.pickupAddress.addressLineTwo,
      addressTownCity: inputs.pickupAddress.addressTownCity,
      addressPostCode: inputs.pickupAddress.addressPostCode,
      addressCountryCode: 'UK',
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    }).fetch();

    var newVendor = await Vendor.create({
      imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      name: inputs.name,
      type: inputs.type,
      description: inputs.description,
      walletAddress: inputs.walletAddress,
      phoneNumber: inputs.phoneNumber,
      pickupAddress: newAddress.id,
      deliveryPartner: inputs.deliveryPartner,
      status: inputs.status,
      rating: inputs.rating,
      costLevel: inputs.costLevel,
      isVegan: inputs.isVegan,
      minimumOrderAmount: inputs.minimumOrderAmount,
    }).fetch();
    await Address.update(newAddress.id).set({
      vendor: newVendor.id
    });

    // All done.
    return exits.success({
      id: newVendor.id,
    });
  },
};
