// import moment from 'moment';

import { ParseBarcodesUploadInputs } from '../../../api/helpers/parse-barcodes-upload';
import {
  OmitId,
  ProductCategoryType,
  ProductOptionType,
  ProductOptionValueType,
  CategoryGroupType,
  ProductType,
  SailsActionDefnType,
  VendorType,
} from '../../../scripts/utils';
import {
  CreateSailsModelType,
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';

declare var sails: sailsVegi;
declare var Vendor: SailsModelType<VendorType>;
declare var Product: SailsModelType<ProductType>;
declare var CategoryGroup: SailsModelType<CategoryGroupType>;
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var ProductOption: SailsModelType<ProductOptionType>;
declare var ProductOptionValue: SailsModelType<ProductOptionValueType>;


export type UploadProductsInputs = {
  vendorId: number;
  supplierName: string;
  upload: ParseBarcodesUploadInputs['upload'];
  // consider a renameColumns json map arg to allow businesses to upload a doc with their own column headers
};

export type UploadProductsResult = true | false;

export type UploadProductsExits = {
  success: (unusedData: UploadProductsResult) => any;
  notFound: (unusedMsg?:string) => any;
  error: (unusedArg?:Error|string) => any;
};

const _exports: SailsActionDefnType<
  UploadProductsInputs,
  UploadProductsResult,
  UploadProductsExits
> = {
  friendlyName: 'ParseBarcodesUpload',

  files: ['upload'],

  inputs: {
    vendorId: {
      type: 'number',
      required: true,
    },
    supplierName: {
      type: 'string',
      required: true,
    },
    upload: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    success: {
      data: false,
    },
    error: {
      statusCode: 401,
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: UploadProductsInputs,
    exits: UploadProductsExits
  ) {
    const vendor = await Vendor.findOne(inputs.vendorId);

    if(!vendor){
      return exits.notFound('No vendor found');
    }
    
    const uploadPovs = await sails.helpers.parseBarcodesUpload.with({
      vendorId: inputs.vendorId,
      supplierName: inputs.supplierName,
      upload: inputs.upload,
    });

    if(!uploadPovs){
      return exits.error('Unable to parse barcodes csv');
    }
    

    try {
      //todo: make into a DB transaction
      // await Product.createEach(uploadPovs.products);

      const defaultCategoryGroups = await CategoryGroup.find();
      const defaultCategoryGroup = defaultCategoryGroups[0];

      const createProductCategory = async (name: string) => {
        const createProductCategory: CreateSailsModelType<ProductCategoryType> = {
          products: [],
          name: name,
          imageUrl: '',
          vendor: inputs.vendorId,
          categoryGroup: defaultCategoryGroup.id,
        };
        const newProductCategory = await ProductCategory.create(
          createProductCategory
        ).fetch();
        return newProductCategory;
      };
      const createProduct = async (product:OmitId<ProductType>, newProductCategories: ProductCategoryType[]) => {
        let _catId = product.category.id;
        const _newCats = newProductCategories.filter(pc => pc.name === product.category.name);
        if(_newCats && _newCats.length){
          _catId = _newCats[0].id;
        }
        const createProduct: CreateSailsModelType<ProductType> = {
          name: product.name,
          status: product.status,
          description: product.description,
          imageUrl: product.imageUrl,
          shortDescription: product.shortDescription,
          basePrice: product.basePrice,
          isAvailable: product.isAvailable,
          priority: product.priority,
          isFeatured: product.isFeatured,
          vendorInternalId: product.vendorInternalId,
          stockCount: product.stockCount,
          stockUnitsPerProduct: product.stockUnitsPerProduct,
          sizeInnerUnitValue: product.sizeInnerUnitValue,
          sizeInnerUnitType: product.sizeInnerUnitType,
          productBarCode: product.productBarCode,
          supplier: product.supplier,
          brandName: product.brandName,
          taxGroup: product.taxGroup,
          vendor: inputs.vendorId,
          category: _catId,
          proxyForVegiProduct: null,
          options: [],
        };
        const newProduct = await Product.create(createProduct).fetch();
        // const createProductOptions = product.options.map((po) =>  {
        //   const createProductOption: CreateSailsModelType<ProductOptionType> = {
        //     name: po.name,
        //     isRequired: po.isRequired,
        //     product: newProduct.id,
        //     values: []
        //   };
        //   return createProductOption;
        // });
        const createProductOptionPromise = async (po:ProductOptionType) => {
          const createProductOption: CreateSailsModelType<ProductOptionType> = {
            name: po.name,
            isRequired: po.isRequired,
            product: newProduct.id,
            values: []
          };
          const newProductOption = await ProductOption.create(createProductOption).fetch();
          const createProductOptions = po.values.map((pov) => {
            const createProductOptionValue: CreateSailsModelType<ProductOptionValueType> = {
              name: pov.name,
              description: pov.description,
              isAvailable: pov.isAvailable,
              priceModifier: pov.priceModifier,
              option: newProductOption.id,
            };
            return createProductOptionValue;
          });
          await ProductOptionValue.createEach(createProductOptions);
        };
        const createProductOptionPromises = product.options.map((po) => createProductOptionPromise(po));
        await Promise.all(createProductOptionPromises);
      };

      // await Product.createEach(uploadPovs.products);
      const newProductCategories = await Promise.all(uploadPovs.productCategories.map((product) => createProductCategory(product)));
      await Promise.all(
        uploadPovs.products.map((product) =>
          createProduct(product, newProductCategories)
        )
      );

      // BUG! Issue here is that we then need each product id to then map to productOption.product to create htem
      // BUG: UsageError: Invalid initial data for new records.\n' +
      // 'Details:\n' +
      // '  Could not use one of the provided new records: Could not use specified `options`.  If specified, expected `options` to be an array of ids (representing the records to associate).

      // await ProductOption.createEach(uploadPovs.productOptions);
      // await ProductOptionValue.createEach(uploadPovs.productOptionValues);
    } catch (error) {
      return exits.error(`Unable to create Products from parsed data. Please check data upload.\n\nError -> ${error}`);
    }

    return exits.success(true);
  },
};

module.exports = _exports;
