import axios from 'axios';
// import moment from 'moment';
import { ESCAPIRateVegiProductResponseType, SailsActionDefnType } from '../../scripts/utils';

import {
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  ProductType,
  ESCRatingType,
} from '../../scripts/utils';

declare var ESCRating: SailsModelType<ESCRatingType>;
declare var sails: sailsVegi;

export type UpdateProductRatingInputs = {
  productIds: ProductType['id'][]
};

export type UpdateProductRatingResult = {
  ratings: { [x: number]: ESCAPIRateVegiProductResponseType };
};

export type UpdateProductRatingExits = {
  success: (unusedData: UpdateProductRatingResult) => any;
};

const _exports: SailsActionDefnType<
  UpdateProductRatingInputs,
  UpdateProductRatingResult,
  UpdateProductRatingExits
> = {
  friendlyName: 'Update product rating',

  inputs: {
    // productBarcodes: {
    //   type: 'ref',
    //   description: 'The array of product barcodes',
    //   required: true,
    // },
    productIds: {
      type: 'ref',
      description: 'The array of product ids',
      required: true,
    },
  },

  exits: {
    success: {
      data: null,
    },
  },

  fn: async function (
    inputs: UpdateProductRatingInputs,
    exits: UpdateProductRatingExits
  ) {
    const instance = axios.create({
      baseURL: sails.config.custom.vegiScoreApi,
      timeout: 2000,
      // headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
    });
    
    const findMatchInVegiScoreApi = async (productId: number) => {
      let data: ESCAPIRateVegiProductResponseType | null = null;
      try {
        const response = await instance.get<ESCAPIRateVegiProductResponseType>(
          `rate-vegi-product/${productId}`
          // {
          //   params: queryParameters,
          // }
        );

        sails.log.verbose(response.request);

        //todo: save the rating to vegi db ESCRating table and workout hwo to show explanations if we arent saving them to vegi db?...

        await ESCRating.create({
          calculatedOn: response.data.new_rating.rating.calculated_on,
          escRatingId: response.data.new_rating.rating.id,
          rating: response.data.new_rating.rating.rating,
          product: response.data.new_rating.rating.product,
        });

        data = response.data;
      } catch (err) {
        sails.log.error(`${err}`);
        // return exits.error(`Failed to fetch rating from vegi-esc-server for productId: ${productId}`);
        return null;
      }
      return {[productId]: data};
    };

    const vegiRatingsListEntries = await Promise.all(inputs.productIds.map((id) => findMatchInVegiScoreApi(id)));

    const vegiRatings: { [x: number]: ESCAPIRateVegiProductResponseType } =
      Object.assign({}, ...vegiRatingsListEntries);

    return exits.success({
      ratings: vegiRatings,
    });
  },
};

module.exports = _exports;
