import axios from 'axios';
import moment from 'moment';

import { ESCRatingType, SailsActionDefnType, datetimeStrFormatExactForSQLDATE } from '../../../scripts/utils';
import {
  SailsModelType,
} from '../../interfaces/iSails';

declare var ESCRating: SailsModelType<ESCRatingType>;


export type UpdateProductRatingInputs = {
    id: number | null | undefined;
    createdAt: number;
    escRatingId: string;
    rating: number;
    calculatedOn: Date;
    product: number;
  };

export type UpdateProductRatingResult = {
  id: number;
} | false;

export type UpdateProductRatingExits = {
  success: (unusedData: UpdateProductRatingResult) => any;
  notFound: (unusedErr?:Error|string) => any;
  error: (unusedErr?:Error|string) => any;
};

const _exports: SailsActionDefnType<
  UpdateProductRatingInputs,
  UpdateProductRatingResult,
  UpdateProductRatingExits
> = {
  friendlyName: 'UpdateProductRating',

  inputs: {
    id: {
      type: 'number',
      required: false,
      allowNull: true,
    },
    createdAt: {
      type: 'number',
      required: false,
      allowNull: true,
    },
    escRatingId: {
      type: 'string',
      required: true,
    },
    rating: {
      type: 'number',
      required: true,
      min: 0,
      max: 5,
    },
    calculatedOn: {
      type: 'ref',
      required: false,
    },
    product: {
      type: 'number',
      required: true,
    }
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      // message: 'Product not found for public id',
      statusCode: 404,
    },
    error: {
      // message: 'Product not found for public id',
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: UpdateProductRatingInputs,
    exits: UpdateProductRatingExits
  ) {
    const x = await ESCRating.create({
      calculatedOn: moment(inputs.calculatedOn).format(datetimeStrFormatExactForSQLDATE),
      createdAt: inputs.createdAt,
      escRatingId: inputs.escRatingId,
      product: inputs.product,
      rating: inputs.rating,
    }).fetch();
    return exits.success({
      id: x.id
    });
  },
};

module.exports = _exports;
