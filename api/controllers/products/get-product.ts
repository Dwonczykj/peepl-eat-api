import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  ProductType,
  ProductCategoryType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Product: SailsModelType<ProductType>;
declare var ProductCategory: SailsModelType<ProductCategoryType>;


export type GetProductInputs = {
  productId: number,
};

export type GetProductResponse = {
  product: sailsModelKVP<ProductType>;
  category: sailsModelKVP<ProductCategoryType>;
};

export type GetProductExits = {
  success: (unusedData: GetProductResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  GetProductInputs,
  GetProductResponse,
  GetProductExits
> = {
  friendlyName: 'GetProduct',

  inputs: {
    productId: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    issue: {
      statusCode: 403,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
  },

  fn: async function (
    inputs: GetProductInputs,
    exits: GetProductExits
  ) {
    try {
      const products = await Product.find({
        id: inputs.productId
      });
  
      if(products && products.length){
        var category: sailsModelKVP<ProductCategoryType> | null = null;
        const product = products[0];
        if(product.category){
          category = await ProductCategory.findOne({
            id: product.category,
          });
        }
        return exits.success({
          product: product,
          category: category,
        });
      }
    } catch (error) {
      sails.log.error(`Error thrown from get-product action: ${error}`);
      return exits.error(error);
    }
    return exits.notFound();
  },
};

module.exports = _exports;
