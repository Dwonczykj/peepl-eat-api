import { SailsModelType, sailsVegi } from '../../interfaces/iSails';
import { ProductSuggestionType } from '../../../scripts/utils';
import { Stream } from 'node:stream';
import _ from 'lodash';


declare var sails: sailsVegi;
declare var ProductSuggestion: SailsModelType<ProductSuggestionType>;


type _UploadProductSuggestionInputsType = {
  name: string;
  images: Array<Stream>;
  qrCode: string;
  additionalInformation: string;
  imageUrls: Array<string>;
};

type _UploadProductSuggestionResponseType = ProductSuggestionType;

const _exports = {
  friendlyName: 'Upload product suggestion',

  description: 'End point to take consumer information for unregistered products on vegi that we should try and capture',

  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    images: {
      type: 'ref',
      required: true,
      description: 'list of image byte streams',
    },
    qrCode: {
      type: 'string',
      required: true,
      description: 'Barcode or QRCode Identifier for the product'
    },
    additionalInformation: {
      type: 'string',
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      data: null,
    },
    issue: {
      statusCode: 400,
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: _UploadProductSuggestionInputsType,
    exits: {
      success: (unused: _UploadProductSuggestionResponseType) => _UploadProductSuggestionResponseType;
      successJSON: (unused: _UploadProductSuggestionResponseType) => _UploadProductSuggestionResponseType;
      issue: (unusedMessage: Error | string) => void;
      notFound: (unusedMessage: Error | string) => void;
    }
  ) {
    
    inputs.imageUrls = [];
    if (inputs.images && inputs.images.length > 0) {
      for (const img of inputs.images){
        let imageInfo = await sails.helpers.uploadOneS3(img);
        if (imageInfo) {
          inputs.imageUrls.push(sails.config.custom.amazonS3BucketUrl + imageInfo.fd);
        }
      }
    }

    const outKeys: Array<
      keyof Exclude<_UploadProductSuggestionInputsType, 'images'>
    > = ['name', 'imageUrls', 'qrCode', 'additionalInformation'];
    
    const productSuggestion = await ProductSuggestion.create(_.pick(inputs,outKeys)).fetch();

    return exits.success(productSuggestion);
  },
};

export type UploadProductSuggestionResponseType = Awaited<ReturnType<typeof _exports.fn>> & _UploadProductSuggestionResponseType;

export type UploadProductSuggestionInputs = {
  [key in keyof typeof _exports.inputs]: typeof _exports.inputs[key]['type'] extends 'string'
    ? string
    : typeof _exports.inputs[key]['type'] extends 'number'
    ? number
    : typeof _exports.inputs[key]['type'] extends 'boolean'
    ? boolean
    : any;
} & {
  // ... type overrides here
} & _UploadProductSuggestionInputsType;

module.exports = _exports;
