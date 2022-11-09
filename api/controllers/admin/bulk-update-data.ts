import { sailsVegi } from '../../interfaces/iSails';

declare var sails: sailsVegi;

type BulkUpdateDataResponseType = {
  success: false;
  message: string
} | {success: true};


module.exports = {
  friendlyName: 'Edit product category',

  description: '',

  inputs: {
    modelType: {
      type: 'string',
      required: true,
      description: 'The id of the product category',
    },
    data: {
      type: 'ref',
      required: true,
      description: 'json[] format of data to create or update',
    },
    createOrUpdateMode: {
      type: 'string',
      required: true,
      isIn: ['create', 'update'],
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
    notSupported: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: {
      modelType: string;
      data: any[];
      createOrUpdateMode: 'create' | 'update';
    },
    exits: {
      success: (
        unusedArg: BulkUpdateDataResponseType
      ) => BulkUpdateDataResponseType;
      successJSON: (
        unusedArg: BulkUpdateDataResponseType
      ) => BulkUpdateDataResponseType;
      // notFound: () => void;
      notSupported: (unusedMessage: string) => void;
    }
  ) {
    if (!Array.isArray(inputs.data)) {
      return exits.notSupported(`Data must be in array format`);
    }

    if (inputs.modelType === 'ProductCategory') {
      if (inputs.createOrUpdateMode === 'create') {
        await sails.helpers.createProductCategories.with({
          productCategories: inputs.data,
        });
        // await ProductCategory.createEach(inputs.data.map<OmitId<ProductCategoryType>>((_dataEntry:OmitId<ProductCategoryType>) => {
        //   return {
        //     name: _dataEntry.name,
        //     vendor: _dataEntry.vendor,
        //     categoryGroup: _dataEntry.categoryGroup,
        //     imageUrl: _dataEntry.imageUrl,
        //     products: (_dataEntry.products as ProductType[]).map<OmitId<ProductType>>((_dp) => {
        //       return {
        //         id: _dp.id,
        //         name: _dp.name,
        //         description: _dp.description,
        //         shortDescription: _dp.shortDescription,
        //         basePrice: _dp.basePrice,
        //         imageUrl: _dp.imageUrl,
        //         isAvailable: _dp.isAvailable,
        //         priority: _dp.priority,
        //         isFeatured: _dp.isFeatured,
        //         status: _dp.status,
        //         vendor: _dp.vendor,
        //         category: _dp.category,
        //         options: _dp.options.map<OmitId<ProductOptionType>>((_dpOpt) => {
        //           return {
        //             id: _dpOpt.id,
        //             name: _dpOpt.name,
        //             isRequired: _dpOpt.isRequired,
        //             product: _dp.id,
        //             values: _dpOpt.values,
        //           };
        //         })
        //       };
        //     }),
        //   };
        // }))
      } else if (inputs.createOrUpdateMode === 'update') {
        await sails.helpers.editProductCategories.with({
          productCategories: inputs.data,
        });
      }
    } else {
      return exits.notSupported(
        `Updating data for model type: ${inputs.modelType} is not supported`
      );
    }

    // Return the new product category
    // return exits.success(newCategoryGroup);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({
        success: true
      });
    } else {
      return exits.success({
        success: true,
      });
    }
  },
};
