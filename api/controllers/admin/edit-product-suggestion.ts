import {
  ProductSuggestionType, SailsActionDefnType,
} from '../../../scripts/utils';
import { SailsModelType } from '../../interfaces/iSails';

declare var ProductSuggestion: SailsModelType<ProductSuggestionType>;

type EditProductSuggestionInput = {
  id: ProductSuggestionType['id'];
  name: ProductSuggestionType['name'];
  qrCode: ProductSuggestionType['qrCode'];
  store: ProductSuggestionType['store'];
  additionalInformation: ProductSuggestionType['additionalInformation'];
  productProcessed: ProductSuggestionType['productProcessed'];
};
type EditProductSuggestionResponse = {
  productSuggestion: ProductSuggestionType;
};
type EditProductSuggestionExits = {
  success: (
    unusedArg: EditProductSuggestionResponse
  ) => EditProductSuggestionResponse;
  successJSON: (
    unusedResult: EditProductSuggestionResponse
  ) => EditProductSuggestionResponse;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  EditProductSuggestionInput,
  EditProductSuggestionResponse,
  EditProductSuggestionExits
> = {
  friendlyName: 'Edit product category',

  description: '',

  inputs: {
    id: {
      type: 'number',
      required: true,
      description: 'The id of the product',
    },
    name: {
      type: 'string',
      required: true,
      description: 'The name of the product',
      maxLength: 150,
    },
    qrCode: {
      type: 'string',
      required: true,
      maxLength: 50,
    },
    store: {
      type: 'string',
      required: true,
      description: 'The Retailer Name for the product',
      maxLength: 150,
    },
    additionalInformation: {
      type: 'string',
      required: true,
    },
    productProcessed: {
      type: 'boolean',
      required: true,
    },
  },

  exits: {
    success: {
      description: 'New product category created.',
      statusCode: 200,
    },
    successJSON: {
      statusCode: 200,
    },
    notFound: {
      statusCode: 404,
      responseType: 'notFound',
    },
    error: {
      statusCode: 400,
    },
    badRequest: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: EditProductSuggestionInput,
    exits: EditProductSuggestionExits
  ) {
    
    const qrCodeRe = RegExp(/^[0-9]+$/);

    if (!inputs.id) {
      return exits.badRequest('Bad ID');
    } else if (!inputs.name) {
      return exits.badRequest('Bad Product Name');
    } else if (!inputs.qrCode || !qrCodeRe.test(inputs.qrCode)) {
      return exits.badRequest('Bad QR Code for Product');
    } else if (!inputs.additionalInformation) {
      return exits.badRequest('Bad Additional Information supplied for Product Suggestion');
    }

    const updated = await ProductSuggestion.updateOne(inputs.id).set({
      name: inputs.name,
      qrCode: inputs.qrCode,
      store: inputs.store,
      additionalInformation: inputs.additionalInformation,
      productProcessed: inputs.productProcessed,
    });
    if(!updated){
      return exits.notFound();
    }
    return exits.success({
      productSuggestion: updated
    });
  },
};

module.exports = _exports;
