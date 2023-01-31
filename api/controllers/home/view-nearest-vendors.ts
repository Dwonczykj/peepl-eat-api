import { AddressType, FulfilmentMethodType, VendorType } from '../../../scripts/utils';
import { sailsModelKVP, SailsModelType, sailsVegi } from "../../../api/interfaces/iSails";
import { Coordinate } from "../../../scripts/google-maps";

declare var sails: sailsVegi;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;

export type ViewNearestVendorInput = {
  location: { [unusedKey in keyof Coordinate]: string } | string;
  distance?: number | null;
  fulfilmentMethodType: FulfilmentMethodType['methodType'];
};

export type ViewNearestVendorResult = {
  vendors: Array<VendorType>;
};

module.exports = {
  friendlyName: 'View dashboard',

  description: 'Display Dashboard page.',

  inputs: {
    location: {
      type: 'ref',
      description: 'coordinate: {lat,lng} of the user',
      required: true,
    },
    distance: {
      type: 'number',
      required: false,
      description: 'the max distance to search for vendors from location in KM',
      allowNull: true,
    },
    fulfilmentMethodType: {
      type: 'string',
      isIn: ['delivery', 'collection'],
      required: true,
    }
  },

  exits: {
    success: {
      viewTemplatePath: 'pages/home/nearest-vendors',
    },
    successJSON: {
      statusCode: 200,
    },
    badFormat: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: ViewNearestVendorInput,
    exits: {
      success: (unusedArg: ViewNearestVendorResult) => void;
      successJSON: (unusedArg: ViewNearestVendorResult) => void;
      badFormat: (unusedArg: string) => void;
    }
  ) {
    let location: Coordinate;
    if (
      typeof inputs.location === 'string' &&
      inputs.location.match(
        /^[+-]?([0-9]*[.])?[0-9]+,[+-]?([0-9]*[.])?[0-9]+$/g
      ) !== null
    ) {
      const m = inputs.location.match(
        /^([+-]?(?:[0-9]*[.])?[0-9]+),([+-]?(?:[0-9]*[.])?[0-9]+)$/i
      );
      location = {
        lat: Number.parseFloat(m[1]),
        lng: Number.parseFloat(m[2]),
      };
    } else if (typeof inputs.location !== 'string') {
      location = {
        lat: Number.parseFloat(inputs.location.lat),
        lng: Number.parseFloat(inputs.location.lng),
      };
    } else {
      return exits.badFormat('location arg must be formatted: "number,number"');
    }
    const { vendors, distances } = await sails.helpers.getVendorsInSphere.with({
      origin: location,
      radiusMeters: inputs.distance && inputs.distance * 1000.0,
    });

    const vendorCanFulfilLambda = async (vendor:VendorType) => {
      if (inputs.fulfilmentMethodType === 'collection'){
        return { [vendor.id]: true };
      }
      let dFM: { maxDeliveryDistance?: number } = vendor.deliveryFulfilmentMethod;
      if (typeof(vendor.deliveryFulfilmentMethod) === 'number'){
        dFM = await FulfilmentMethod.findOne(vendor.deliveryFulfilmentMethod);
      }
      if (dFM.maxDeliveryDistance && (dFM.maxDeliveryDistance * 1000.0) < distances[vendor.id]) {
        return { [vendor.id]: false };
      }
      return { [vendor.id]: true };
    };
    const vendorsCanFulfilKVPs = await Promise.all(vendors.map(v => vendorCanFulfilLambda(v)));
    const vendorsCanFulfil: {[x: number]: boolean;} = Object.assign({}, ...vendorsCanFulfilKVPs);
    const filteredVendors = vendors.filter(v => vendorsCanFulfil[v.id]);

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ vendors: filteredVendors });
    } else {
      return exits.success({ vendors: filteredVendors });
    }
  },
};
