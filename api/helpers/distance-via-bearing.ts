import { Coordinate } from "../../scripts/google-maps";

export type DistanceViaBearingInputs = {
  point: Coordinate;
  bearing: number;
  distance: number;
};

export type DistanceViaBearingResult = Coordinate;

module.exports = {
  friendlyName:
    'Get a destination point xKM from a starting point on a given bearing',

  description: '',

  inputs: {
    point: {
      type: 'ref',
      required: true,
    },
    bearing: {
      type: 'number',
      required: true,
    },
    distance: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (
    inputs: DistanceViaBearingInputs,
    exits: {
      success: (unusedD: DistanceViaBearingResult) => DistanceViaBearingResult;
    }
  ) {
    // ~ http://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const d = inputs.distance * 1000.0; // metres
    const φ1 = (inputs.point.lat * Math.PI) / 180; // φ, λ in radians
    const λ1 = (inputs.point.lng * Math.PI) / 180; // φ, λ in radians
    const θ = (((inputs.bearing + 360) % 360) * Math.PI) / 180; // θ in radians
    
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(d / R) +
        Math.cos(φ1) * Math.sin(d / R) * Math.cos(θ)
    );
    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(d / R) * Math.cos(φ1),
        Math.cos(d / R) - Math.sin(φ1) * Math.sin(φ2)
      );

    return exits.success({
      lat: (φ2 * 180) / Math.PI,
      lng: (λ2 * 180) / Math.PI,
    });
  },
};
