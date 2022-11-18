import {v4 as uuidv4} from 'uuid';
import { sailsVegi } from '../interfaces/iSails';
import GoogleMapsApi from '../../scripts/google-maps';
declare var sails: sailsVegi;


export type GetCoordinatesForAddressInput = {
  addressLineOne: string;
  addressLineTwo: string;
  addressTownCity: string;
  addressPostCode: string;
  addressCountryCode: string;
};
export type GetCoordinatesForAddressResult = {
  lat: number;
  lng: number;
};

module.exports = {
  friendlyName: 'Check address is valid using placesApi',

  inputs: {
    addressLineOne: {
      type: 'string',
      required: true,
    },
    addressLineTwo: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    addressTownCity: {
      type: 'string',
      required: true,
    },
    addressPostCode: {
      type: 'string',
      required: true,
    },
    addressCountryCode: {
      type: 'string',
      required: false,
      defaultsTo: 'UK',
    },
  },

  exits: {
    success: {
      description: 'All done.',
      data: null,
    },
    badInput: {
      description: 'Input arguments of incorrect type',
      data: null,
      error: null,
    },
    placesApiError: {
      description: 'places api returned an error from http request',
    },
  },

  fn: async function (
    inputs: GetCoordinatesForAddressInput,
    exits: {
      success: (
        unusedResult: GetCoordinatesForAddressResult
      ) => GetCoordinatesForAddressResult;
      badInput: (unusedError?: Error | string) => void;
      placesApiError: (unusedError?: Error | string) => void;
    }
  ) {
    // initialize services
    // ~ https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
    const mapsApi = new GoogleMapsApi(sails.config.custom.distancesApiKey, sails);
    const location = await mapsApi.getGeoLocation(inputs);
    return exits.success(location);
    // const geocoder = new google.maps.Geocoder;

    // try {
    //   const response = await geocoder.geocode({
    //     address: [
    //       inputs.addressLineOne,
    //       inputs.addressLineTwo,
    //       inputs.addressTownCity,
    //       inputs.addressPostCode,
    //       inputs.addressCountryCode,
    //     ].join(', '),
    //   });
    //   const results = response.results;
    //   const result1 = results[0].geometry.location;


    //   return exits.success({
    //     lat: result1.lat(),
    //     lng: result1.lng()
    //   });
    // } catch (error) {
    //   return exits.placesApiError(error);
    // }
  },
};
