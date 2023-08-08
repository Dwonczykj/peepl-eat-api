import axios from 'axios';
import GoogleMapsApi from '../../scripts/google-maps';
import {v4 as uuidv4} from 'uuid';
import { sailsVegi } from '../interfaces/iSails';


declare var sails: sailsVegi;


export type CheckAddressIsValidInput = {
  addressLineOne: string;
  addressLineTwo: string;
  addressTownCity: string;
  addressPostCode: string;
  addressCountryCode: string;
  latitude: number;
  longitude: number;
};
export type CheckAddressIsValidResult = {
  validAddress: boolean;
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
    latitude: {
      type: 'number',
      required: true,
    },
    longitude: {
      type: 'number',
      required: true,
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
    inputs: CheckAddressIsValidInput,
    exits: {
      success: (
        unusedResult: CheckAddressIsValidResult
      ) => CheckAddressIsValidResult;
      badInput: (unusedError?: Error | string) => void;
      placesApiError: (unusedError?: Error | string) => void;
    }
  ) {
    // Make axios client get requests to check that if use formatted address
    // to fetch location from places, the first response is the same coordinates as was
    // passed in.
    //TODO: Add to validate-order helper functions

    // initialize services
    // // ~ https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
    // const geocoder = new google.maps.Geocoder();

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

    //   if (
    //     Math.abs(result1.lat() - inputs.latitude) > 0.01 ||
    //     Math.abs(result1.lng() - inputs.longitude) > 0.01
    //   ) {
    //     return exits.success({ validAddress: false });
    //   }
    //   return exits.success({ validAddress: true });
    // } catch (error) {
    //   return exits.placesApiError(error);
    // }

    const mapsApi = new GoogleMapsApi(sails.config.custom.distancesApiKey, sails);

    const location = await mapsApi.getGeoLocation(inputs);

    if (location!==null){
      if (
        Math.abs(location.lat - inputs.latitude) > 0.01 ||
        Math.abs(location.lng - inputs.longitude) > 0.01
      ) {
        return exits.success({ validAddress: false });
      }
      return exits.success({ validAddress: true });
    }
    return exits.success({ validAddress: false });
    
    // const instance = axios.create({
    //   baseURL: sails.config.custom.googleApiBaseUrl,
    //   timeout: 2000,
    //   headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
    // });

    // const sessionToken = uuidv4(); //TODO: Should sessions live longer than one helper function call?

    // var queryParameters = {
    //   fields: 'geometry',
    //   input: `${inputs.addressLineOne}, ${inputs.addressLineTwo}, ${inputs.addressTownCity}, ${inputs.addressPostCode}, ${inputs.addressCountryCode}`,
    //   inputtype: 'textquery',
    //   language: 'en',
    //   components: 'country:gb',
    //   key: sails.config.custom.placesApiKey,
    //   sessionToken: sessionToken,
    // };

    // try {
    //   const response = await instance.get(
    //     sails.config.custom.placesApiRelUrlFindPlace,
    //     {
    //       params: queryParameters,
    //     }
    //   );

    //   if (response.status === 200) {
    //     if (
    //       !Array.isArray(response.data['candidates']) ||
    //       response.data['candidates'].length < 1
    //     ) {
    //       return exits.success({ validAddress: false });
    //     }
    //     const firstCoordinates: { lat: number; lng: number } =
    //       response.data['candidates'][0]['geometry']['location'];
    //     if (
    //       Math.abs(firstCoordinates.lat - inputs.latitude) > 0.01 ||
    //       Math.abs(firstCoordinates.lng - inputs.longitude) > 0.01
    //     ) {
    //       return exits.success({ validAddress: false });
    //     }
    //     return exits.success({ validAddress: true });
    //   }

    // } catch (err) {
    //   sails.log.error(`${err}`);
    //   return exits.placesApiError(err);
    // }
  },
};
