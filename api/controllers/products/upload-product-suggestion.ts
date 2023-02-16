import { sailsModelKVP, SailsModelType } from '../../interfaces/iSails';
import { ProductSuggestionImageType, ProductSuggestionType, SailsActionDefnType } from '../../../scripts/utils';

import _ from 'lodash';

declare var ProductSuggestion: SailsModelType<ProductSuggestionType>;
declare var ProductSuggestionImage: SailsModelType<ProductSuggestionImageType>;


type _UploadProductSuggestionInputsType = {
  name: ProductSuggestionType['name'];
  qrCode: ProductSuggestionType['qrCode'];
  store?: ProductSuggestionType['store'];
  imageUrls: Array<{ url: string; uid: string }>;
  additionalInformation?: ProductSuggestionType['additionalInformation'];
  // productProcessed?: ProductSuggestionType['productProcessed'];
};

type _UploadProductSuggestionResponseType = ProductSuggestionType;

type _UploadProductSuggestionExits = {
  success: (
    unusedArg: _UploadProductSuggestionResponseType
  ) => _UploadProductSuggestionResponseType;
  // successJSON: (
  //   unusedResult: _UploadProductSuggestionResponseType
  // ) => _UploadProductSuggestionResponseType;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  // error: (unusedErr: Error | String) => void;
  // badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  _UploadProductSuggestionInputsType,
  _UploadProductSuggestionResponseType,
  _UploadProductSuggestionExits
> = {
  friendlyName: 'Upload product suggestion',

  description:
    'End point to take consumer information for unregistered products on vegi that we should try and capture',

  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    qrCode: {
      type: 'string',
      required: true,
      description: 'Barcode or QRCode Identifier for the product',
    },
    store: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    imageUrls: {
      type: 'ref',
      required: true,
      description:
        'list of image urls & uids -> Array<{url:string, uid: string}>;',
    },
    additionalInformation: {
      type: 'string',
      required: false,
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
    exits: _UploadProductSuggestionExits
  ) {
    // inputs.imageUrls = [];
    // if (inputs.images && inputs.images.length > 0) {
    //   for (const img of inputs.images){
    //     let imageInfo = await sails.helpers.uploadOneS3(img);
    //     if (imageInfo) {
    //       inputs.imageUrls.push(sails.config.custom.amazonS3BucketUrl + imageInfo.fd);
    //     }
    //   }
    // }

    const getImage = async (
      img: _UploadProductSuggestionInputsType['imageUrls'][0]
    ) => {
      const imgObjs = await ProductSuggestionImage.find({
        publicUid: img.uid,
        imageUrl: img.url,
      });
      var imgObj: sailsModelKVP<ProductSuggestionImageType>;
      if (!imgObjs || imgObjs.length < 1) {
        imgObj = (await ProductSuggestionImage.create({
          imageUrl: img.url,
        }).fetch()) as any;
      } else if (imgObjs.length > 1) {
        imgObj = imgObjs[0];
      } else {
        imgObj = imgObjs[0];
      }
      return imgObj;
    };
    const imageCollection: sailsModelKVP<ProductSuggestionImageType>[] =
      await Promise.all(inputs.imageUrls.map(getImage));

    const outKeys: Array<
      keyof Omit<_UploadProductSuggestionInputsType, 'imageUrls'>
    > = ['name', 'store', 'qrCode', 'additionalInformation'];

    const productSuggestion = await ProductSuggestion.create(
      _.pick(inputs, outKeys)
    ).fetch();

    await ProductSuggestion.addToCollection(
      productSuggestion.id,
      'imageUrls'
    ).members(imageCollection.map((o) => o.id));

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
