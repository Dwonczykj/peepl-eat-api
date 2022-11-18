import { StatusLiteral, VendorType } from '../../../scripts/utils';
import {v4 as uuidv4} from 'uuid';
import { SailsModelType } from 'api/interfaces/iSails';

declare var sails: any;
declare var Vendor: SailsModelType<VendorType>;

export type CreateVendorInputs = {
  name: string;
  description: string;
  type: 'restaurant' | 'shop';
  image: any;
  walletAddress: string;
  phoneNumber?: string | null;
  pickupAddressLineOne?: string | null;
  pickupAddressLineTwo?: string | null;
  pickupAddressCity?: string | null;
  pickupAddressPostCode?: string | null;
  pickupAddressLatitude?: number | null;
  pickupAddressLongitude?: number | null;
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
    pickupAddressLineOne: {
      type: 'string',
      allowNull: true,
    },
    pickupAddressLineTwo: {
      type: 'string',
      allowNull: true,
    },
    pickupAddressCity: {
      type: 'string',
      allowNull: true,
    },
    pickupAddressPostCode: {
      type: 'string',
      allowNull: true,
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

    let imageInfo = await sails.helpers.uploadOneS3(inputs.image);

    if (!imageInfo) {
      sails.log('no image file attached to create-vendor call');
      return exits.noFileAttached();
    }

    if (
      inputs.pickupAddressLatitude > 180 ||
      inputs.pickupAddressLatitude < -180
    ) {
      return exits.badGeoCoordinate({
        latitudeAboveBounds: inputs.pickupAddressLatitude > 180,
      });
    }
    if (
      inputs.pickupAddressLongitude > 180 ||
      inputs.pickupAddressLongitude < -180
    ) {
      return exits.badGeoCoordinate({
        longitudeAboveBounds: inputs.pickupAddressLongitude > 180,
      });
    }

    let coordinates = {
      lat: inputs.pickupAddressLatitude,
      lng: inputs.pickupAddressLongitude,
    };

    try {
      if (inputs.pickupAddressLineOne && inputs.pickupAddressPostCode) {
        const _coordinates = await sails.helpers.getCoordinatesForAddress.with({
          addressLineOne: inputs.pickupAddressLineOne || '',
          addressLineTwo: inputs.pickupAddressLineTwo || '',
          addressTownCity: inputs.pickupAddressCity || '',
          addressPostCode: inputs.pickupAddressPostCode || '',
          addressCountryCode: 'UK',
        });
        coordinates = {
          lat: _coordinates.lat,
          lng: _coordinates.lng,
        };
      }
    } catch (err) {
      sails.log.error(
        `Failed to fetch coordinates of editted vendor pickup address: ${err}`
      );
    }
    inputs.pickupAddressLatitude = coordinates.lat;
    inputs.pickupAddressLongitude = coordinates.lng;

    var newVendor = await Vendor.create({
      imageUrl: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      name: inputs.name,
      type: inputs.type,
      description: inputs.description,
      walletAddress: inputs.walletAddress,
      phoneNumber: inputs.phoneNumber,
      pickupAddressLineOne: inputs.pickupAddressLineOne,
      pickupAddressLineTwo: inputs.pickupAddressLineTwo,
      pickupAddressCity: inputs.pickupAddressCity,
      pickupAddressPostCode: inputs.pickupAddressPostCode.toLocaleUpperCase(),
      pickupAddressLatitude: inputs.pickupAddressLatitude,
      pickupAddressLongitude: inputs.pickupAddressLongitude,
      deliveryPartner: inputs.deliveryPartner,
      status: inputs.status,
      rating: inputs.rating,
      costLevel: inputs.costLevel,
      isVegan: inputs.isVegan,
      minimumOrderAmount: inputs.minimumOrderAmount,
    }).fetch();

    // All done.
    return exits.success({
      id: newVendor.id,
    });
  },
};
