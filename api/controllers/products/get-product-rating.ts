import axios from 'axios';
import moment from 'moment';
import { SailsActionDefnType } from '../../../scripts/utils';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../../api/interfaces/iSails';
import {
  ProductType,
  ProductOptionValueType,
  ESCRatingType,
  ESCExplanationType,
  SustainedAPIChoiceGetProductsResponseType,
  datetimeStrFormat,
  SustainedAPIChoiceGetImpactsResponseType,
} from '../../../scripts/utils';

const SustainedGradeToRatingMap = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0.5,
  G: 0,
};

declare var Product: SailsModelType<ProductType>;
declare var ProductOptionValue: SailsModelType<ProductOptionValueType>;
declare var ESCRating: SailsModelType<ESCRatingType>;
declare var ESCExplanation: SailsModelType<ESCExplanationType>;
declare var sails: sailsVegi;

export type GetProductRatingInputs = {
  // productBarcodes: ESCRatingType['productPublicId'][];
  productIds: ProductType['id'][];
};

export type GetProductRatingResult = {
  [barcode: string]: {
    id: number;
    createdAt: number;
    productPublicId: string;
    rating: number;
    evidence: object;
    calculatedOn: Date;
    product: ProductType;
    explanations: sailsModelKVP<ESCExplanationType>[];
  } | null;
};

export type GetProductRatingExits = {
  success: (unusedData: GetProductRatingResult | null) => any;
  notFound: (unusedErr?:Error|string) => any;
};

const _exports: SailsActionDefnType<
  GetProductRatingInputs,
  GetProductRatingResult,
  GetProductRatingExits
> = {
  friendlyName: 'Get product rating',

  description:
    'Get the options for the product as well as the relevant options.',

  inputs: {
    // productBarcodes: {
    //   type: 'ref',
    //   description: 'The barcodes of the products to get ratings for',
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
    notFound: {
      // message: 'Product not found for public id',
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: GetProductRatingInputs,
    exits: GetProductRatingExits
  ) {
    const result = await sails.helpers.getProductRatingByBarcodes.with({
      // productBarcodes: inputs.productBarcodes,
      productIds: inputs.productIds,
      allowFetch: true,
    });
    if (!result) {
      return exits.notFound('No Products found for barcodes');
    }
    return exits.success(result);
  },
};

module.exports = _exports;
