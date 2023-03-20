import { OmitId, ProductCategoryType, ProductOptionType, ProductOptionValueType, ProductType, SailsActionDefnType, VendorType } from '../../scripts/utils';
import {
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import { PassThrough, Readable, Stream } from 'node:stream';
// import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as dataForge from 'data-forge';

const dropKey = <T,K extends keyof T>(object: T, dropKey:K) => {
  let state: Omit<T,K> = Object.assign({},...Object.keys(object).filter(k => k !== dropKey).map(k => ({[k]: object[k]})));
  return state;
  // {[dropKey], ...state} = object;
  // const initialState: Omit<T,TKey> = {
  //   ...state,
  // };
  // return initialState;
};
// const dropKeys = <T,K extends keyof T>(object: T, dropKeys:K[]) => {
//   let state: { [P in Exclude<keyof T, K>]: T[P]; } = Object.assign(Object.keys(object).filter(k => !dropKeys.includes(k as keyof T)).map(k => ({[k]: object[k]})))
//   return state;
//   // {[dropKey], ...state} = object;
//   // const initialState: Omit<T,TKey> = {
//   //   ...state,
//   // };
//   // return initialState;
// }

declare var sails: sailsVegi;
declare var Product: SailsModelType<ProductType>;
declare var Vendor: SailsModelType<VendorType>;
declare var ProductCategory: SailsModelType<ProductCategoryType>;
declare var ProductOptionValue: SailsModelType<ProductOptionValueType>;

type RowPredicate = (row:any) => boolean;
type RowTransformer<TRes> = (row:any) => TRes;


type unit = {
  amount: number | null;
  type: string | null;
}

/// convert @unitsDescriptor to a tuple of the number of units and the unit type.
const parseUnit: (unitsDescriptor:string) => unit = (unitsDescriptor:string) => {
  const exp = RegExp(/(-?[0-9.,]*)([^0-9]+)/g);
  const m = unitsDescriptor.match(exp);
  if(!m || m.length < 1){
    return {
      amount: null,
      type: null,
    };
  }
  return {
    amount: Number.parseFloat(m[1]),
    type: m[2],
  };

};


export type ParseBarcodesUploadInputs = {
  vendorId: number;
  supplierName: string;
  upload: Readable & Stream & {
    _files: {
      stream: PassThrough,
      status: string | 'bufferingOrWriting';
    }[];
  };
  // consider a renameColumns json map arg to allow businesses to upload a doc with their own column headers
};

export type ParseBarcodesUploadResult =
  {
    // products: CreateSailsModelType3<ProductType>[];
    // productOptions: CreateSailsModelType3<ProductOptionType>[];
    // productOptionValues: CreateSailsModelType3<ProductOptionValueType>[];
    productCategories: string[];
    products: OmitId<ProductType>[];
  }
  // | CreateSailsModelType<ProductOptionValueType>[]
  | false;

export type ParseBarcodesUploadExits = {
  success: (unusedData: ParseBarcodesUploadResult) => ParseBarcodesUploadResult;
};

const _exports: SailsActionDefnType<
  ParseBarcodesUploadInputs,
  ParseBarcodesUploadResult,
  ParseBarcodesUploadExits
> = {
  friendlyName: 'ParseBarcodesUpload',

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
  },

  fn: async function (
    inputs: ParseBarcodesUploadInputs,
    exits: ParseBarcodesUploadExits
  ) {
    if(!inputs.upload || !inputs.upload._files || inputs.upload._files.length < 1){
      return exits.success(false);
    }

    const vendor = await Vendor.findOne(inputs.vendorId).populate('productCategories');

    if(!vendor || !vendor.productCategories || vendor.productCategories.length < 1){
      sails.log.error(`No Product Categories exist for this vendor: ${inputs.vendorId}. Please create one to upload products.`);
      return exits.success(false);
    }
    const defaultProductCategory = vendor.productCategories[0] as ProductCategoryType;

    const productCategories = Object.assign(
      {},
      ...vendor.productCategories.map((x) => ({ [x.name]: x }))
    );

    // const defaultProductCategoriesForVendor = await ProductCategory.find({
    //   vendor: inputs.vendorId,
    // });

    // if(!vendor || !defaultProductCategoriesForVendor || defaultProductCategoriesForVendor.length < 1){
    //   sails.log.error(`No Product Categories exist for this vendor: ${inputs.vendorId}. Please create one to upload products.`);
    //   return exits.success(false);
    // }
    // const defaultProductCategory = defaultProductCategoriesForVendor[0];

    const parseData = async (csvAsString:string) => {
      const _products = await Product.find({
        vendor: inputs.vendorId,
      }).populate('options&options.values');

      const predicate: RowPredicate = (row) => {
        if(row['Product Key'] && row['Product Key'] !== 'Product Key'
          && row['Outer barcode']
          && row['Description']
          && (row['RRP'] || row['RRP'] === 0)
          && (row['Size - Units per case'] || row['Size - Units per case'] === 0)
          && _products.filter(p => p.productBarCode.trim() === row['Outer barcode'].trim()).length < 1){
          // && _products.filter(p => p.options.filter(po => po.values.filter(pov => pov.productBarCode.trim() === row['Outer barcode'].trim()).length > 0).length > 0).length < 1){
          return true;
        }
        return false;
      };

      const getProductCategoriesTransform: RowTransformer<string> = (row) => {
        return row['Pricelist Category'];
      };

      const transform: RowTransformer<OmitId<ProductType>> = (row) => {
        const unit = parseUnit(row['Size - inner unit']);

        const productDeep: OmitId<ProductType> = {
          name: row['Description'],
          description: row['Pricelist Description'],
          imageUrl: '',
          vendor: vendor,
          status: 'active',
          shortDescription: '',
          basePrice: row['RRP'] || 0.0,
          isAvailable: false,
          priority: 0,
          isFeatured: false,
          ingredients: null,
          vendorInternalId: row['Product Key'],
          stockCount: 0,
          stockUnitsPerProduct: row['Size - Units per case'],
          sizeInnerUnitValue: unit.amount || 0,
          sizeInnerUnitType: unit.type || 'unknown',
          productBarCode: row['Inner barcode'],
          supplier: inputs.supplierName,
          brandName: row['Brand name'],
          taxGroup: row['FGOSV categories'],
          options: [],
          category: Object.assign({},defaultProductCategory,{name: row['Pricelist Category']}),
        };
        const poDeep: OmitId<ProductOptionType> = {
          name: 'Default',
          isRequired: false,
          product: productDeep as any,
          values: [],
        };


        const povDeep:OmitId<ProductOptionValueType> = {
          name: row['Description'],
          description: row['Pricelist Description'],
          priceModifier: 0,
          isAvailable: false,
          option: poDeep as any,
        };
        poDeep.values.push(povDeep as any);
        productDeep.options.push(poDeep as any);
        return productDeep;

        // const cp: CreateSailsModelType3<ProductType> = {
        //   name: row['Description'],
        //   description: row['Pricelist Description'],
        //   imageUrl: '',
        //   vendor: inputs.vendorId,
        //   status: 'active',
        //   shortDescription: '',
        //   basePrice: row['RRP'] || 0.0,
        //   isAvailable: false,
        //   priority: 0,
        //   isFeatured: false,
        //   options: [],
        //   category: defaultProductCategory.id,
        //   ingredients: null,
        // };
        // const defaultPo: CreateSailsModelType2<ProductOptionType> = {
        //   name: 'Default',
        //   isRequired: false,
        //   product: cp as any,
        //   values: [],
        // };
        // const cpov: CreateSailsModelType2<ProductOptionValueType> = {
        //   name: row['Description'],
        //   description: row['Pricelist Description'],
        //   priceModifier: 0,
        //   isAvailable: false,
        //   stockCount: 0,
        //   stockUnitsPerProduct: row['Size - Units per case'],
        //   sizeInnerUnitValue: unit.amount || 0,
        //   sizeInnerUnitType: unit.type || 'unknown',
        //   productBarCode: row['Inner barcode'],
        //   supplier: inputs.supplierName,
        //   brandName: row['Brand name'],
        //   taxGroup: row['FGOSV categories'],
        //   option: defaultPo,
        // };
        // defaultPo.values.push(cpov);
        // return cpov;
      };

      let df: dataForge.IDataFrame<number, any> = dataForge.fromCSV(csvAsString, {
        columnNames: [
          'Product Key',
          'Pricelist Category',
          'Brand name',
          'Pricelist Description',
          'Description',
          'Size - Units per case',
          'Size - inner unit',
          'Suma selling price',
          'RRP',
          'VAT code',
          'Pricelist code',
          'FGOSV categories',
          'Inner barcode',
          'Outer barcode',
          'Catering',
        ],
        skipEmptyLines: true,
        dynamicTyping: false, //DONT PARSE BARCODES AS WE STORE AS STRINGS
      });

      df = df  // .parseDates(["Column B"]) // Parse date columns.
        .parseInts([
          'Size - Units per case', //DONT PARSE BARCODES AS WE STORE AS STRINGS
        ]) // Parse integer columns.
        .parseFloats([
          'RRP'
        ]) // Parse float columns.
        // .dropSeries([
        //   "Column F"
        // ]) // Drop certain columns.
        .where(row => predicate(row)); // Filter rows.
      // .select(row => transform(row)); // Transform the data.
      // .asCSV()
      // .writeFileSync("./output-data-file.csv"); // Write to output CSV file (or JSON!)
      //todo: parse and map to ProductOptionValue type for each row and then upload to DB if there is not already an item with matching barcode? or some sort of vendorItemId

      // (dataForge as any).readFileSync('./input-data-file.csv') // Read CSV file (or JSON!)
      //   .parseCSV()
      //   .parseDates(["Column B"]) // Parse date columns.
      //   .parseInts(["Column B", "Column C"]) // Parse integer columns.
      //   .parseFloats(["Column D", "Column E"]) // Parse float columns.
      //   .dropSeries(["Column F"]) // Drop certain columns.
      //   .where(row => predicate(row)) // Filter rows.
      //   .select(row => transform(row)) // Transform the data.
      //   .asCSV()
      //   .writeFileSync("./output-data-file.csv"); // Write to output CSV file (or JSON!)

      const _newProductCategories = df
        .toArray()
        .map(getProductCategoriesTransform);
      const newProductCategories = [...new Set(_newProductCategories)];
      const uploadPovs = df.toArray().map(transform);

      // const products: CreateSailsModelType3<ProductType>[] = [];
      // const productOptions: CreateSailsModelType3<ProductOptionType>[] = [];
      // const productOptionValues: CreateSailsModelType3<ProductOptionValueType>[] = [];

      // uploadPovs.forEach(pov => {
      //   const _pov = dropKey(pov,'option');
      //   productOptionValues.push(_pov);
      //   let _po: any = dropKey(pov.option, 'product');
      //   _po = {
      //     name: _po.name,
      //     isRequired: _po.isRequired,
      //     values: [_pov] as any,
      //   };
      //   // productOptions.push(_po);
      //   productOptions.push({
      //     name: _po.name,
      //     isRequired: _po.isRequired,
      //     values: [_pov] as any,
      //   });

      //   const _p = pov.option.product;
      //   // products.push(_p);
      //   products.push({
      //     name: _p.name,
      //     description: _p.description,
      //     isAvailable: _p.isAvailable,
      //     shortDescription: _p.shortDescription,
      //     basePrice: _p.basePrice,
      //     imageUrl: _p.imageUrl,
      //     priority: _p.priority,
      //     isFeatured: _p.isFeatured,
      //     status: _p.status,
      //     ingredients: _p.ingredients,
      //     category: defaultProductCategory.id,
      //     vendor: inputs.vendorId,
      //     options: [
      //       _po
      //     ] as any
      //   });
      // });

      return exits.success({
        // products: products,
        // productOptions: productOptions,
        // productOptionValues: productOptionValues,
        productCategories: newProductCategories,
        products: uploadPovs,
      });
    };


    let uploadedFile: {
      fd: string;
      ffd?: string;
      filename: string;
      extra?: any;
      field: keyof ParseBarcodesUploadInputs;
      name: string;
      size: number;
      status: string | 'finished';
      type: 'text/csv' | string;
    } | null;

    const uploadDir = '.tmp/uploads/';
    let csvData = null;

    await sails.uploadOne(
      inputs.upload as any,
      {
        dirname: require('path').resolve(sails.config.appPath, uploadDir)
      }, // ~ https://www.notion.so/gember/Sails-js-b949611a98654dd091c3a0758b170db3?pvs=4#f5f1bfb659094541a9583d90c1f4887c
      async (err, uploadedFiles) => {
        if (err) {
          sails.log.error(err);
        }

        uploadedFile = uploadedFiles;
        const uploadedFileFileName = uploadedFile && uploadedFile.filename;
        if (!uploadedFileFileName) {
          sails.log.error(
            `Error uploading image to s3-bucket: and no files uploaded!`
          );
        }

        uploadedFile =
          uploadedFile && uploadedFile.fd
            ? {
              ...uploadedFile,
              ffd: uploadedFile.fd,
            }
            : null;
        if (!uploadedFile) {
          return exits.success(undefined);
        }

        const fs = require('fs');

        fs.readFile(uploadedFile.fd, 'utf8', async (err, data) => {
          if(err){
            sails.log.error(err);
          }else{
            // return res.json(200, {message: 'Ok', data: data});
            csvData = data;
            // sails.log.info(csvData);
            await parseData(csvData);
          }

          //delete file from .tmp

          fs.unlinkSync(uploadedFile.fd);

          return;
        });

      },
    );


  },
};

module.exports = _exports;
