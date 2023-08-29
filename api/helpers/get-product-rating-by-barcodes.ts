import axios from 'axios';
import moment from 'moment';
import { ESCAPIRateVegiProductResponseType, SailsActionDefnType } from '../../scripts/utils';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  ProductType,
  ESCRatingType,
  SustainedAPIChoiceGetProductsResponseType,
  datetimeStrFormat,
} from '../../scripts/utils';

declare var Product: SailsModelType<ProductType>;
declare var ESCRating: SailsModelType<ESCRatingType>;
declare var sails: sailsVegi;

export type GetProductRatingInputs = {
  // productBarcodes: ESCRatingType['productPublicId'][];
  productIds: ProductType['id'][]
};

export type GetProductRatingResult = {
    [productId: string]: {
  id: number;
  createdAt: number;
  productPublicId: string;
  rating: number;
  // evidence: object;
  calculatedOn: Date;
  product: ProductType;
} | null};

export type GetProductRatingExits = {
  success: (unusedData: GetProductRatingResult) => any;
};

const _exports: SailsActionDefnType<
  GetProductRatingInputs,
  GetProductRatingResult,
  GetProductRatingExits
> = {
  friendlyName: 'Get product rating',

  inputs: {
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
    inputs: GetProductRatingInputs,
    exits: GetProductRatingExits
  ) {
    const formatResult = (
      rating: ESCRatingType,
    ) => {
      const x: GetProductRatingResult[''] = {
        id: rating.id,
        createdAt: rating.createdAt,
        productPublicId: rating.escRatingId,
        rating: rating.rating,
        // evidence: rating.evidence,
        calculatedOn: rating.calculatedOn,
        product: rating.product,
      };
      return x;
    };

    // * check ESCRatings table for RECENT result information
    let ttl = moment
      .utc()
      .subtract(sails.config.custom.escRatingsTTLDays * 24, 'hours')
      .format(datetimeStrFormat); // e.g. 25/12/2022 17:00

    const ratingsEntriesForAllBarcodes = await ESCRating.find({
      // productPublicId: inputs.productBarcodes,
      product: inputs.productIds,
      calculatedOn: {
        '>': ttl,
      },
    }).populate('product');

    // Get rating from DB if exists
    const getRatingsForBarcodeFromDb = async (id: number) => {
      
      const ratingsEntries = ratingsEntriesForAllBarcodes.filter(
        (re) => (re.product as any) === id
      );
      if (ratingsEntries && ratingsEntries.length > 0) {
        // todo use most recent entry for each product barcode
        const rating = ratingsEntries.sort((a, b) =>
          moment.utc(b.calculatedOn).isAfter(moment.utc(a.calculatedOn))
            ? -1
            : 1
        )[0];
        return { [id]: formatResult(rating)};
      } else {
        return { [id]: null };
      }
    };

    const ratingsFromDb = await Promise.all(
      inputs.productIds.map((id) =>
        getRatingsForBarcodeFromDb(id)
      )
    );
    const resultDict: GetProductRatingResult = Object.assign(
      {},
      ...ratingsFromDb
    );

    return exits.success(resultDict);
  },
};

module.exports = _exports;
