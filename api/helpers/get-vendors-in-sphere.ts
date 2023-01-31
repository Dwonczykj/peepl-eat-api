import { sailsModelKVP, SailsModelType, sailsVegi } from '../interfaces/iSails';
import { AddressType, VendorType } from '../../scripts/utils';
import { Coordinate } from '../../scripts/google-maps';

declare var sails: sailsVegi;
declare var Address: SailsModelType<AddressType>;
declare var Vendor: SailsModelType<VendorType>;

export type GetVendorsInSphereInputs = {
  origin: Coordinate;
  radiusMeters?: number | null;
};

export type GetVendorsInSphereResult = {
  vendors: Array<VendorType>,
  distances: {[k:number]:number},
};
// export type GetVendorsInSphereResult = Array<{
//   id: VendorType['id'];
//   pickupAddress: VendorType['pickupAddress']
// }>;

module.exports = {
  friendlyName: 'Filter a list of coordinates if in delivery catchment area',

  description:
    'Use to get all restaurants that deliver to a user by using user location as origin',

  inputs: {
    origin: {
      type: 'ref',
      required: true,
    },
    radiusMeters: {
      type: 'number',
      required: false,
      allowNull: true,
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (
    inputs: GetVendorsInSphereInputs,
    exits: {
      success: (unusedD: GetVendorsInSphereResult) => GetVendorsInSphereResult;
    }
  ) {
    let potentialAdresses: sailsModelKVP<AddressType>[];
    if (inputs.radiusMeters) {
      const N = await sails.helpers.distanceViaBearing.with({
        point: inputs.origin,
        bearing: 0,
        distance: inputs.radiusMeters,
      });
      const E = await sails.helpers.distanceViaBearing.with({
        point: inputs.origin,
        bearing: 90,
        distance: inputs.radiusMeters,
      });
      const S = await sails.helpers.distanceViaBearing.with({
        point: inputs.origin,
        bearing: 180,
        distance: inputs.radiusMeters,
      });
      const W = await sails.helpers.distanceViaBearing.with({
        point: inputs.origin,
        bearing: 270,
        distance: inputs.radiusMeters,
      });

      potentialAdresses = await Address.find({
        and: [
          {
            longitude: {
              '>=': inputs.origin.lng >= W.lng ? W.lng : W.lng - 360,
            },
          },
          {
            longitude: {
              '<=': inputs.origin.lng <= E.lng ? E.lng : E.lng + 360,
            },
          },
          {
            latitude: {
              '>=': inputs.origin.lat >= S.lat ? S.lat : S.lat - 360,
            },
          },
          {
            latitude: {
              '<=': inputs.origin.lat <= N.lat ? N.lat : N.lat + 360,
            },
          },
          {
            vendor: { '!=': null },
          },
        ],
      });
    } else {
      potentialAdresses = await Address.find({
        vendor: { '!=': null },
      });
    }

    const prom = async (address: sailsModelKVP<AddressType>) => {
      const d = await sails.helpers.distanceHaversine.with({
        pointA: inputs.origin,
        pointB: {
          lat: address.latitude,
          lng: address.longitude,
        },
      });
      if (d < inputs.radiusMeters || !inputs.radiusMeters) {
        return {
          ...address,
          distanceAway: d,
        };
      } else {
        return null;
      }
    };
    const x = await Promise.all(potentialAdresses.map(prom));
    const addresses = x
      .filter((addr) => addr !== null)
      .sort((a, b) => a.distanceAway - b.distanceAway);
    const vendorIds = addresses.map((a) => a.vendor);
    const vendors = await Vendor.find({
      id: vendorIds,
    }).populate('fulfilmentPostalDistricts');

    return exits.success({
      vendors: vendors,
      distances: Object.assign(
        {},
        ...addresses.map((a) => ({ [a.vendor]: a.distanceAway }))
      ),
    });
  },
};
