import axios from 'axios';
import GoogleMapsApi from '../../scripts/google-maps';
import { FulfilmentMethodType } from '../../scripts/utils';
import { v4 as uuidv4 } from 'uuid';
import { SailsModelType, sailsVegi } from '../interfaces/iSails';
import e from 'express';


declare var sails: sailsVegi;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;

export type FulfilmentMethodDeliversToAddressInput = {
  fulfilmentMethod: number;
  // addressLineOne: string;
  // addressLineTwo: string;
  // addressTownCity: string;
  // addressPostCode: string;
  // addressCountryCode: string;
  latitude: number;
  longitude: number;
};

export type FulfilmentMethodDeliversToAddressResult = { canDeliver: boolean };

module.exports = {
  friendlyName: 'Does a fulfilment method allow delivery to input address',

  inputs: {
    fulfilmentMethod: {
      type: 'number',
      required: true,
    },
    // addressLineOne: {
    //   type: 'string',
    //   required: true,
    // },
    // addressLineTwo: {
    //   type: 'string',
    //   required: false,
    //   defaultsTo: '',
    // },
    // addressTownCity: {
    //   type: 'string',
    //   required: true,
    // },
    // addressPostCode: {
    //   type: 'string',
    //   required: true,
    // },
    // addressCountryCode: {
    //   type: 'string',
    //   required: false,
    //   defaultsTo: 'UK',
    // },
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
    inputs: FulfilmentMethodDeliversToAddressInput,
    exits: {
      success: (
        unusedResult: FulfilmentMethodDeliversToAddressResult
      ) => FulfilmentMethodDeliversToAddressResult;
      badInput: (unusedError?: Error | string) => void;
      error: (unusedError?: Error | string) => void;
    }
  ) {
    const fulfilmentMethod = await FulfilmentMethod.findOne(
      inputs.fulfilmentMethod
    ).populate('fulfilmentOrigin');
    if (fulfilmentMethod.methodType !== 'delivery') {
      return exits.success({ canDeliver: false });
    }

    // initialize services
    // ~ https://developers.google.com/maps/documentation/javascript/examples/distance-matrix
    // const service = new google.maps.DistanceMatrixService();

    // build request
    // const origin1 = { lat: fulfilmentMethod.fulfilmentOrigin.latitude, lng: fulfilmentMethod.fulfilmentOrigin.longitude };
    // const origin2 = [fulfilmentMethod.fulfilmentOrigin.addressLineOne,fulfilmentMethod.fulfilmentOrigin.addressLineTwo,fulfilmentMethod.fulfilmentOrigin.addressTownCity, fulfilmentMethod.fulfilmentOrigin.addressPostCode, fulfilmentMethod.fulfilmentOrigin.addressCountryCode].join(', ');
    // const destinationA = [inputs.addressLineOne,inputs.addressLineTwo,inputs.addressTownCity, inputs.addressPostCode, inputs.addressCountryCode].join(', ');
    // const destinationB = { lat: inputs.latitude, lng: inputs.longitude };
    const vendorOrigin = {
      lat: fulfilmentMethod.fulfilmentOrigin.latitude,
      lng: fulfilmentMethod.fulfilmentOrigin.longitude,
    };

    if (inputs.latitude === 0 && inputs.longitude === 0){
      // assume delivery coordinates are not defined
      return exits.success({ canDeliver: false });
    }

    const deliveryDestination = {
      lat: inputs.latitude,
      lng: inputs.longitude,
    };

    const mapsApi = new GoogleMapsApi(
      sails.config.custom.distancesApiKey,
      sails
    );

    try {
	    const distance = await mapsApi.getDistanceBetweenPlaces(vendorOrigin, deliveryDestination);
	    if(distance !== null){
	      if (distance <= fulfilmentMethod.maxDeliveryDistance) {
	        return exits.success({ canDeliver: true });
	      }
	      return exits.success({ canDeliver: false });
	    } else {
	      return exits.success({ canDeliver: false });
	    }
    } catch (error) {
      sails.log.error(error);
      return exits.success({ canDeliver: false });
    }

    // const request = {
    //   origins: [vendorOrigin],
    //   destinations: [deliveryDestination],
    //   travelMode: google.maps.TravelMode.DRIVING,
    //   unitSystem: google.maps.UnitSystem.METRIC,
    //   avoidHighways: true,
    //   avoidTolls: false,
    //   key: sails.config.custom.distancesApiKey,
    // };

    // // get distance matrix response
    // const response = await service.getDistanceMatrix(request);

    // // show on map
    // const originList = response.originAddresses;
    // const destinationList = response.destinationAddresses;
    // // 1 row for each element of the origin and then one element for each destiantion within that object
    // const rows = response.rows.map((row, originInd) => {
    //   return row.elements.map((element, destInd) => {
    //     return {
    //       ...element,
    //       origin: originList[originInd],
    //       destination: destinationList[destInd],
    //     };
    //   });
    // });

    // if (!rows || rows.length < 1 || rows[0].length < 1) {
    //   return exits.error('Failed to fetch distance metrics from api');
    // }

    // const metrics = rows[0][0];

    // if (
    //   metrics.distance.value > fulfilmentMethod.maxDeliveryDistance ||
    //   metrics.status !== 'OK'
    // ) {
    //   return exits.success({ canDeliver: false });
    // }
    // return exits.success({ canDeliver: true });
  },
};
