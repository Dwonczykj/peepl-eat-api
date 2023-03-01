import { ProductSuggestionImageType } from 'scripts/utils';
import { SailsModelType, sailsVegi } from '../../interfaces/iSails';


declare var sails: sailsVegi;
declare var ProductSuggestionImage: SailsModelType<ProductSuggestionImageType>;

type _UploadProductSuggestionImageInputsType = {
  uid: string;
  image: any;
};

type _UploadProductSuggestionImageResponseType = {
  url: string;
  uid: string;
}

const _exports = {
  friendlyName: 'Upload product suggestion image',

  files: ['image'],

  description:
    'Upload an image for a given uid that refers to a client generated identifier for their product suggestion',

  inputs: {
    uid: {
      type: 'string',
      required: true,
    },
    image: {
      type: 'ref',
      required: true,
      description: 'image byte stream',
    },
  },

  exits: {
    success: {
      data: null,
    },
    error: {
      statusCode: 500,
    },
    uploadFailed: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: _UploadProductSuggestionImageInputsType,
    exits: {
      success: (
        unused: _UploadProductSuggestionImageResponseType
      ) => _UploadProductSuggestionImageResponseType;
      error: (unusedMessage: Error | string) => void;
      uploadFailed: (unusedMessage: Error | string) => void;
    }
  ) {
    let imageUrl = '';
    if (inputs.image) {
      let imageInfo = await sails.helpers.uploadOneS3(inputs.image);
      if (imageInfo) {
        imageUrl = sails.config.custom.amazonS3BucketUrl + imageInfo.fd;
      }
    }
    if (!imageUrl) {
      return exits.uploadFailed('Unable to upload image to S3');
    }

    const productSuggestionImage = await ProductSuggestionImage.create({
      imageUrl: imageUrl,
    }).fetch();

    return exits.success({
      url: imageUrl,
      uid: productSuggestionImage.publicUid,
    });
  },
};

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
} & _UploadProductSuggestionImageInputsType;

module.exports = _exports;
