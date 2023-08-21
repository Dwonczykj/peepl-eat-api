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
  ProductType
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var Product: SailsModelType<ProductType>;


export type AllProductsForVendorInputs = {
  vendorId: number,
};

export type AllProductsForVendorResponse = {
  products: sailsModelKVP<ProductType>[] | ProductType[];
};

export type AllProductsForVendorExits = {
  success: (unusedData: AllProductsForVendorResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  AllProductsForVendorInputs,
  AllProductsForVendorResponse,
  AllProductsForVendorExits
> = {
  friendlyName: 'AllProductsForVendor',

  inputs: {
    vendorId: {
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
    inputs: AllProductsForVendorInputs,
    exits: AllProductsForVendorExits
  ) {
    const productsUnsorted = await Product.find().populate('category');

    const products = productsUnsorted.sort((a, b) => {
      const statae: ProductType['status'][] = ['active', 'inactive'];
      return (
        statae.indexOf(a.status) - statae.indexOf(b.status) ||
        a.isAvailable && !b.isAvailable ? -1 : !a.isAvailable && b.isAvailable ? 1 : 0 ||
        a.isFeatured && !b.isFeatured ? -1 : !a.isFeatured && b.isFeatured ? 1 : 0 ||
        a.name.localeCompare(b.name)
      );
    });

    return exits.success({
      products: products,
    });
  },
};

module.exports = _exports;
