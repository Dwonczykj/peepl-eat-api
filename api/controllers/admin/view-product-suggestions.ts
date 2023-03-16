import {
  ProductSuggestionType,
  SailsActionDefnType,
} from '../../../scripts/utils';
import { sailsModelKVP, SailsModelType } from '../../interfaces/iSails';

declare var ProductSuggestion: SailsModelType<ProductSuggestionType>;

type ViewProductSuggestionInput = {};
type ViewProductSuggestionResponse = {
  productSuggestions: sailsModelKVP<ProductSuggestionType>[];
};
type ViewProductSuggestionExits = {
  success: (
    unusedArg: ViewProductSuggestionResponse
  ) => ViewProductSuggestionResponse;
  successJSON: (
    unusedResult: ViewProductSuggestionResponse
  ) => ViewProductSuggestionResponse;
  error: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  ViewProductSuggestionInput,
  ViewProductSuggestionResponse,
  ViewProductSuggestionExits
> = {
  friendlyName: 'View vendors',

  description: 'Display "Vendors" page.',

  inputs: {},

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/suggestions',
    },
    successJSON: {
      statusCode: 200,
    },
    error: {
      statusCode: 400,
    },
  },

  fn: async function (inputs, exits) {
    var productSuggestions = await ProductSuggestion.find();

    const result: ViewProductSuggestionResponse = { productSuggestions };

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(result);
    } else {
      return exits.success(result);
    }
  },
};

module.exports = _exports;
