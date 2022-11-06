import { CategoryGroupType, OmitId, ProductCategoryType, ProductOptionType, ProductType } from '../../../scripts/utils';
import { SailsModelType, sailsVegi, ShallowSailsModels } from '../../interfaces/iSails';
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
declare var sails: sailsVegi;


module.exports = {
  friendlyName: 'Edit product category',

  description: '',

  inputs: {
    modelTypeName: {
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
    notFound: {
      statusCode: 404,
      responseType: 'notFound',
    },
  },

  fn: async function (
    inputs: {
      modelTypeName: string;
      data: any[];
      createOrUpdateMode: 'create' | 'update';
    },
    exits: {
      success: () => void;
      successJSON: () => void;
      notFound: () => void;
      notSupported: (unusedMessage:string) => void;
    }
  ) {
    if(!Array.isArray(inputs.data)){
      return exits.notSupported(`Data must be in array format`);
    }

    if (inputs.modelTypeName === 'ProductCategory') {
      if (inputs.createOrUpdateMode === 'create'){
        await sails.helpers.createProductCategories.with({
          productCategories: inputs.data
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
      } else if (inputs.createOrUpdateMode === 'update'){
        await sails.helpers.editProductCategories.with({
          productCategories: inputs.data
        });
      }
    } else {
      return exits.notSupported(
        `Updating data for model type: ${inputs.modelTypeName} is not supported`
      );
    }

    // Return the new product category
    // return exits.success(newCategoryGroup);
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON();
    } else {
      return exits.success();
    }
  },
};
