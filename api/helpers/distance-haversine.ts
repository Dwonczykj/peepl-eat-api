import { Coordinate } from '../../scripts/google-maps';
export type DistanceHaversineInputs = {
  pointA: Coordinate;
  pointB: Coordinate;
};

export type DistanceHaversineResult = number;

module.exports = {
  friendlyName: 'Get the Haversine Distance between 2 geo coordinates',

  description: '',

  inputs: {
    pointA: {
      type: 'ref',
      required: true,
    },
    pointB: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (
    inputs: DistanceHaversineInputs,
    exits: {
      success: (unusedD: DistanceHaversineResult) => DistanceHaversineResult;
    }
  ) {
    // ~ http://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = (inputs.pointA.lat * Math.PI) / 180; // φ, λ in radians
    const φ2 = (inputs.pointB.lat * Math.PI) / 180;
    const Δφ = ((inputs.pointB.lat - inputs.pointA.lat) * Math.PI) / 180;
    const Δλ = ((inputs.pointB.lng - inputs.pointA.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    return exits.success(d);
  },
};
