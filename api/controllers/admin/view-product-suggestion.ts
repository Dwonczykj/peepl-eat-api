import { ProductSuggestionType, SailsActionDefnType } from "../../../scripts/utils";
import { SailsModelType } from "../../interfaces/iSails";

declare var ProductSuggestion: SailsModelType<ProductSuggestionType>;

type ViewProductSuggestionInput = {
  productSuggestionId
};
type ViewProductSuggestionResponse = {
  productSuggestion: ProductSuggestionType;
};
type ViewProductSuggestionExits = {
  success: (
    unusedArg: ViewProductSuggestionResponse
  ) => ViewProductSuggestionResponse;
  successJSON: (
    unusedResult: ViewProductSuggestionResponse
  ) => ViewProductSuggestionResponse;
  error: (unusedErr: Error | String) => void;
  notFound: () => void;
};

const _exports: SailsActionDefnType<
  ViewProductSuggestionInput,
  ViewProductSuggestionResponse,
  ViewProductSuggestionExits
> = {
  friendlyName: 'View product suggestion',

  description: 'Display "View Product Suggestion" page.',

  inputs: {
    productSuggestionId: {
      type: 'number',
    },
  },

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/product-suggestion',
    },
    successJSON: {
      statusCode: 200,
    },
    error: {
      statusCode: 400,
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (inputs, exits) {
    const productSuggestion = await ProductSuggestion.findOne({
      id: inputs.productSuggestionId,
    }).populate('imageUrls');
    if(!productSuggestion){
      return exits.notFound();
    }
    

    // Respond with view or JSON.
    const result: ViewProductSuggestionResponse = {
      productSuggestion,
    };
    if (this.req.wantsJSON) {
      return exits.successJSON(result);
    } else {
      return exits.success(result);
    }
  },
};

module.exports = _exports;
