import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import { ESCExplanationType, ProductType, SailsActionDefnType } from '../../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  UserType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;


export type UpdateProductRatingInputs = {
    id: number;
    createdAt: number;
    productPublicId: string;
    rating: number;
    calculatedOn: Date;
    product: ProductType;
    explanations: ESCExplanationType[];
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
    // create new product ratings always
    


    return exits.success(resultFinal);
  },
};

module.exports = _exports;