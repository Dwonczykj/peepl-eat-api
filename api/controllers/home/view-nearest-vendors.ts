import { AddressType } from '../../../scripts/utils';
import { sailsModelKVP, sailsVegi } from "../../../api/interfaces/iSails";
import { Coordinate } from "../../../scripts/google-maps";

declare var sails: sailsVegi;

export type ViewNearestVendorInput = {
  location: { [unusedKey in keyof Coordinate]: string } | string;
  distance: number;
};

export type ViewNearestVendorResult = {
  addresses: Array<sailsModelKVP<AddressType>>;
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
      required: true,
    },
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
    const addresses = await sails.helpers.getVendorsInSphere.with({
      origin: location,
      radius: inputs.distance,
    });
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ addresses });
    } else {
      return exits.success({ addresses });
    }
  },
};
