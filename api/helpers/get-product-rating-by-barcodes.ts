import axios from 'axios';
import moment from 'moment';
import { SailsActionDefnType } from '../../scripts/utils';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  ProductType,
  ProductOptionValueType,
  ESCRatingType,
  ESCExplanationType,
  SustainedAPIChoiceGetProductsResponseType,
  datetimeStrFormat,
  SustainedAPIChoiceGetImpactsResponseType,
} from '../../scripts/utils';

const SustainedGradeToRatingMap = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0.5,
  G: 0,
};

declare var Product: SailsModelType<ProductType>;
declare var ProductOptionValue: SailsModelType<ProductOptionValueType>;
declare var ESCRating: SailsModelType<ESCRatingType>;
declare var ESCExplanation: SailsModelType<ESCExplanationType>;
declare var sails: sailsVegi;

export type GetProductRatingInputs = {
  productBarcodes: ESCRatingType['productPublicId'][];
};

export type GetProductRatingResult = {
    [barcode: string]: {
  id: number;
  createdAt: number;
  productPublicId: string;
  rating: number;
  evidence: object;
  calculatedOn: Date;
  product: ProductType;
  explanations: sailsModelKVP<ESCExplanationType>[];
} | null};

export type GetProductRatingExits = {
  success: (unusedData: GetProductRatingResult) => any;
};

const _exports: SailsActionDefnType<
  GetProductRatingInputs,
  GetProductRatingResult,
  GetProductRatingExits
> = {
  friendlyName: 'Get product rating',

  inputs: {
    productBarcodes: {
      type: 'ref',
      description:
        'The array of product barcodes',
      required: true,
    },
  },

  exits: {
    success: {
      data: null,
    },
  },

  fn: async function (
    inputs: GetProductRatingInputs,
    exits: GetProductRatingExits
  ) {
    const getResult = <
      T extends sailsModelKVP<ESCExplanationType> | ESCExplanationType
    >(
        rating: ESCRatingType,
        explanations: T[]
      ) => {
      return {
        ...rating,
        ...{
          explanations: explanations,
        },
      } as GetProductRatingResult[''];
    };

    const findMatchInVegiScoreApi = async (name: string, category: string) => {
      const instance = axios.create({
        baseURL: sails.config.custom.vegiScoreApi,
        timeout: 2000,
        // headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
      });

      // ~ https://developer.sustained.com/reference/getproducts
      var queryParameters = {
        name: name,
        category: category,
        // grade: 'A'
        // pageInt: 0
      };

      sails.log.info(
        `GET https://api.sustained.com/choice/v1/products?name=${name}&category=${category}`
      );

      try {
        const response =
          await instance.get<SustainedAPIChoiceGetProductsResponseType>(
            'products',
            {
              params: queryParameters,
            }
          );

        sails.log.info(response.request);

        if (response.status === 200) {
          if (
            !Array.isArray(response.data['products']) ||
            response.data['products'].length < 1
          ) {
            // no similar products found
            sails.log.warn(`No products found on sustained api for string: "${name}". Try a simpler name`);
            return null;
          }
          // * Default to first result?
          const m = response.data.products[0];
          const impactsRelUrl = m.links.impacts.replace(
            sails.config.custom.vegiScoreApi,
            ''
          );
          const responseImpacts =
            await instance.get<SustainedAPIChoiceGetImpactsResponseType>(
              impactsRelUrl
            );

          return {
            result: m,
            impacts: responseImpacts.data.impacts,
            ...m,
          };
        } else{
          sails.log.warn(
            `${sails.config.custom.vegiScoreApi} returned a ${response.status}`
          );

        }
      } catch (err) {
        sails.log.error(err);
        return null;
      }
    };

    inputs.productBarcodes = inputs.productBarcodes.filter(barcode => barcode !== '');

    // todo: check ESCRatings table for RECENT result information
    let ttl = moment
      .utc()
      .subtract(sails.config.custom.escRatingsTTLDays * 24, 'hours')
      .format(datetimeStrFormat); // e.g. 25/12/2022 17:00

    const ratingsEntriesForAllBarcodes = await ESCRating.find({
      productPublicId: inputs.productBarcodes,
      calculatedOn: {
        '>': ttl,
      },
    }).populate('evidence');

    // Get rating from DB if exists
    const getRatingsForBarcodeFromDb = async (barcode:string) => {
      if(!barcode){
        return { ['NO_BARCODE']: null };
      }
      const ratingsEntries = ratingsEntriesForAllBarcodes.filter(re => re.productPublicId === barcode);
      if (ratingsEntries && ratingsEntries.length > 0) {
        // todo use most recent entry for each product barcode
        const rating = ratingsEntries.sort((a, b) =>
          moment.utc(b.calculatedOn).isAfter(moment.utc(a.calculatedOn))
            ? -1
            : 1
        )[0];
        const explanations = await ESCExplanation.find({
          escrating: rating.id,
        });
        return {[barcode]: getResult(rating, explanations)};
        // return exits.success(getResult(rating, explanations));
      } else {
        return {[barcode]: null};
      }
    };
    
    const ratingsFromDb = await Promise.all(inputs.productBarcodes.map((barcode) => getRatingsForBarcodeFromDb(barcode)));
    const resultDict: GetProductRatingResult = Object.assign(
      {},
      ...ratingsFromDb
    );

    const barcodesToSearchFor = inputs.productBarcodes.filter(barcode => !resultDict[barcode]);

    sails.log.info(
      `SEARCHING VEGI SCORING API FOR ${barcodesToSearchFor.length} PRODUCTS as resultDict is ${resultDict}`
    );

    const getRatingsForBarcodeFromWeb = async (barcode:string) => {
      if(!barcode){
        return { ['NO_BARCODE']: null };
      }
      const _productOptionValuess = await ProductOptionValue.find({
        productBarCode: barcode,
      }).populate('option&option.product');

      if (
        !_productOptionValuess ||
        _productOptionValuess.length < 1){
        sails.log.warn(`FOUND no matching productoptionvalue for barcode: ${barcode}`);
        return { ['NO_BARCODE']: null };
      }
      const productOptionValues = _productOptionValuess[0];

      const productOptionName = productOptionValues.option.product.name;
      const product = await Product.findOne(
        productOptionValues.option.product.id
      ).populate('category');
      const productCategory = product.category.name;

      const productNameVal = `${productOptionName} ${productOptionValues.name} ${productOptionValues.brandName}`;
      sails.log.info(
        `Run matching api get for product named: ${productNameVal} with category: ${productCategory}`
      );
      let match = await findMatchInVegiScoreApi(productNameVal, productCategory);
      if (!match) {
        match = await findMatchInVegiScoreApi(product.name, productCategory);
      }
      // todo: populate ESCRatings table with result information
      if (!match) {
        return {[barcode]: null};
        // return exits.success(null);
      }

      const newRating = await ESCRating.create({
        calculatedOn: moment.utc().toISOString(),
        productPublicId: barcode,
        rating: SustainedGradeToRatingMap[match.grade],
        // explanation: explanation,
        evidence: JSON.stringify(match.result),
      }).fetch();

      const impacts = match.impacts.map((impact) => ({
        title: impact.title,
        description: impact.description,
        measure: SustainedGradeToRatingMap[impact.grade],
        escrating: newRating.id,
      }));

      const explanations = await ESCExplanation.createEach(impacts).fetch();

      // await ESCRating.addToCollection(newRating.id, 'explanation').members(explanations.map(e => e.id));

      const result = getResult(newRating, explanations);
      return {[barcode]: result};
    };
    
    const ratingsFromWeb = await Promise.all(
      barcodesToSearchFor.map((barcode) => getRatingsForBarcodeFromWeb(barcode))
    );
    const resultDictFromWeb: GetProductRatingResult = Object.assign(
      {},
      ...ratingsFromWeb
    );
    const resultFinal = Object.assign(resultDict, resultDictFromWeb);

    return exits.success(resultFinal);
  },
};

module.exports = _exports;
