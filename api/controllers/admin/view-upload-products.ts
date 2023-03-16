// import moment from 'moment';

import {
  SailsActionDefnType,
  VendorType,
} from '../../../scripts/utils';
import {
  sailsModelKVP,
  SailsModelType,
} from '../../interfaces/iSails';

declare var Vendor: SailsModelType<VendorType>;


export type ViewUploadProductsInputs = {};

export type ViewUploadProductsResult = {
  vendors: sailsModelKVP<VendorType>[];
};

export type ViewUploadProductsExits = {
  success: (unusedData: ViewUploadProductsResult) => any;
  notFound: (unusedMsg?:string) => any;
  error: (unusedArg?:Error|string) => any;
};

const _exports: SailsActionDefnType<
  ViewUploadProductsInputs,
  ViewUploadProductsResult,
  ViewUploadProductsExits
> = {
  friendlyName: 'ParseBarcodesUpload',

  inputs: {
    
  },

  exits: {
    success: {
      data: false,
      viewTemplatePath: 'pages/admin/upload-products',
    },
    
    error: {
      statusCode: 401,
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: ViewUploadProductsInputs,
    exits: ViewUploadProductsExits
  ) {
    const vendorsUnsorted = await Vendor.find();

    const vendors = vendorsUnsorted.sort((a, b) => {
      const statae: VendorType['status'][] = ['active', 'draft', 'inactive'];
      return (
        statae.indexOf(a.status) - statae.indexOf(b.status) ||
        a.name.localeCompare(b.name)
      );
    });

    return exits.success({vendors});
  },
};

module.exports = _exports;
