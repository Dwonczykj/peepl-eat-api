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
  // productBarcodes: ESCRatingType['productPublicId'][];
  productIds: ProductType['id'][]
  allowFetch:boolean;
};

export type GetProductRatingResult = {
    [productId: string]: {
  id: number;
  createdAt: number;
  productPublicId: string;
  rating: number;
  // evidence: object;
  calculatedOn: Date;
  product: ProductType;
  explanations: ESCExplanationType[];
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
    // productBarcodes: {
    //   type: 'ref',
    //   description: 'The array of product barcodes',
    //   required: true,
    // },
    productIds: {
      type: 'ref',
      description: 'The array of product ids',
      required: true,
    },
    allowFetch: {
      type: 'boolean',
      defaultsTo: true,
      description:
        'If true and no rating exists in last 24 hours for a product, it will go and calculate / fetch a rating',
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
    const getResult = (
      rating: ESCRatingType,
      explanations: ESCExplanationType[]
    ) => {
      const x: GetProductRatingResult[''] = {
        id: rating.id,
        createdAt: rating.createdAt,
        productPublicId: rating.productPublicId,
        rating: rating.rating,
        // evidence: rating.evidence,
        calculatedOn: rating.calculatedOn,
        product: rating.product,
        explanations: explanations,
      };
      return x;
    };

    const findMatchInVegiScoreApi = async (name: string) => {
      if (!inputs.allowFetch) {
        return false;
      }
      const instance = axios.create({
        baseURL: sails.config.custom.vegiScoreApi,
        timeout: 2000,
        // headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
      });

      // ~ connect this to localhost:5002/sustained_similar_product
      var queryParameters = {
        s1: name,
      };

      try {
        const response =
          await instance.get<SustainedAPIChoiceGetProductsResponseType>(
            'sustained/most-similar-product',
            {
              params: queryParameters,
            }
          );

        sails.log.info(response.request);

        return {
          result: response.data,
        };
      } catch (err) {
        sails.log.error(err);
        return null;
      }
    };

    // const findMatchInSustainedApi = async (name: string, category: string) => {
    //   if (!inputs.allowFetch) {
    //     return false;
    //   }
    //   const instance = axios.create({
    //     baseURL: sails.config.custom.vegiScoreApi,
    //     timeout: 2000,
    //     // headers: { Authorization: 'Basic ' + sails.config.custom.peeplAPIKey },
    //   });

    //   // ~ https://developer.sustained.com/reference/getproducts
    //   // ~ connect this to localhost:5002/sustained_similar_product
    //   var queryParameters = {
    //     name: name, //TODO: Can we use our word2vec search endpoint to find similar words here?
    //     // category: category, // DONT include category unless returned in https://api.sustained.com/choice/v1/categories
    //     // grade: 'A'
    //     // pageInt: 0
    //   };

    //   sails.log.info(
    //     `GET https://api.sustained.com/choice/v1/products?name=${name}&category=${category}`
    //   );

    //   try {
    //     const response =
    //       await instance.get<SustainedAPIChoiceGetProductsResponseType>(
    //         'products',
    //         {
    //           params: queryParameters,
    //         }
    //       );

    //     sails.log.info(response.request);

    //     if (response.status === 200) {
    //       if (
    //         !Array.isArray(response.data['products']) ||
    //         response.data['products'].length < 1
    //       ) {
    //         // no similar products found
    //         sails.log.warn(
    //           `No products found on sustained api for string: "${name}". Try a simpler name`
    //         );
    //         return null;
    //       }
    //       // * Default to first result?
    //       const m = response.data.products[0];
    //       const impactsRelUrl = m.links.impacts.replace(
    //         sails.config.custom.vegiScoreApi,
    //         ''
    //       );
    //       const responseImpacts =
    //         await instance.get<SustainedAPIChoiceGetImpactsResponseType>(
    //           impactsRelUrl
    //         );

    //       return {
    //         result: m,
    //         impacts: responseImpacts.data.impacts,
    //         ...m,
    //       };
    //     } else {
    //       sails.log.warn(
    //         `${sails.config.custom.vegiScoreApi} returned a ${response.status}`
    //       );
    //     }
    //   } catch (err) {
    //     sails.log.error(err);
    //     return null;
    //   }
    // };

    // inputs.productBarcodes = inputs.productBarcodes.filter(
    //   (barcode) => barcode !== ''
    // );

    // todo: check ESCRatings table for RECENT result information
    let ttl = moment
      .utc()
      .subtract(sails.config.custom.escRatingsTTLDays * 24, 'hours')
      .format(datetimeStrFormat); // e.g. 25/12/2022 17:00

    const ratingsEntriesForAllBarcodes = await ESCRating.find({
      // productPublicId: inputs.productBarcodes,
      product: inputs.productIds,
      calculatedOn: {
        '>': ttl,
      },
    }).populate('product');

    // Get rating from DB if exists
    const getRatingsForBarcodeFromDb = async (id: number) => {
      // if (!barcode) {
      //   return { ['NO_BARCODE']: null };
      // }
      
      const ratingsEntries = ratingsEntriesForAllBarcodes.filter(
        (re) => (re.product as any) === id
      );
      if (ratingsEntries && ratingsEntries.length > 0) {
        // todo use most recent entry for each product barcode
        const rating = ratingsEntries.sort((a, b) =>
          moment.utc(b.calculatedOn).isAfter(moment.utc(a.calculatedOn))
            ? -1
            : 1
        )[0];
        const explanations = await ESCExplanation.find({
          escrating: rating.id,
        }).populate('escsource');
        return { [id]: getResult(rating, explanations) };
      } else {
        return { [id]: null };
      }
    };

    const ratingsFromDb = await Promise.all(
      inputs.productIds.map((id) =>
        getRatingsForBarcodeFromDb(id)
      )
      // inputs.productBarcodes.map((barcode) =>
      //   getRatingsForBarcodeFromDb(barcode)
      // )
    );
    const resultDict: GetProductRatingResult = Object.assign(
      {},
      ...ratingsFromDb
    );

    const productsToSearchFor = inputs.productIds.filter(
      (id) => !resultDict[id]
    );
    // const barcodesToSearchFor = inputs.productBarcodes.filter(
    //   (barcode) => !resultDict[barcode]
    // );

    sails.log.verbose(
      `SEARCHING VEGI SCORING API FOR ${productsToSearchFor.length} PRODUCTS from vegi ESC api`
    );


    //TODO: rewrite this entire function and get python backend to return escrating structure data with {rating,explanations}
    const lazyScheduleRatingsForProductsFromVegiESCApi = async (ids: number[]) => {
      // if (!barcode) {
      //   return { ['NO_BARCODE']: null };
      // }
      // const _productOptionValuess = await ProductOptionValue.find({
      //   productBarCode: barcode,
      // }).populate('option&option.product');

      // if (!_productOptionValuess || _productOptionValuess.length < 1) {
      //   sails.log.warn(
      //     `FOUND no matching productoptionvalue for barcode: ${barcode}`
      //   );
      //   return { ['NO_BARCODE']: null };
      // }
      // const productOptionValues = _productOptionValuess[0];

      const products = await Product.find({
        id: ids
      });
      
      const createRating = async (p:sailsModelKVP<ProductType>) => {
        const newRating = await ESCRating.create({
          calculatedOn: moment.utc().toISOString(),
          productPublicId: p.productBarCode,
          rating: 0,
          evidence: 'No Information',
          product: p.id,
        }).fetch();

        const explanation = await ESCExplanation.create({
          title: 'No Information',
          description: 'Default zero rating for new products with no rating',
          measure: 0,
          escrating: newRating.id,
        }).fetch();


        
        const result = getResult(newRating, [
          {
            id: explanation.id,
            title: explanation.title,
            reasons: explanation.reasons,
            evidence: explanation.evidence, // this is fine, object does not need to be created by ref ID AS json in db
            measure: explanation.measure,
            escrating: newRating,
            escsource: explanation.escsource,
          },
        ]);
        return { [p.id]: result };
      };
      const results = await Promise.all(products.map(p => createRating(p)));
      const resultsDict = Object.assign({},...results);

      // await ESCRating.addToCollection(newRating.id, 'explanation').members(explanations.map(e => e.id));

      const search_terms = products.map((product) => {
        const productNameVal =
          product.description ||
          product.name;
        return productNameVal;
      });
      
      // let match = await findMatchInVegiScoreApi(
      //   productNameVal,
      // );
      // todo: implement below line
      // let match = await findMatchInVegiScoreApi(ids);
      
      
      // let match = await findMatchInVegiScoreApi(
      //   productNameVal,
      //   productCategory
      // );
      // if (!match) {
      //   match = await findMatchInVegiScoreApi(
      //     product.description,
      //     productCategory
      //   );
      // }

      // // todo: populate ESCRatings table with result information
      // if (!match) {
      //   const newRating = await ESCRating.create({
      //     calculatedOn: moment.utc().toISOString(),
      //     productPublicId: barcode,
      //     rating: 0,
      //     evidence: 'No Information',
      //   }).fetch();

      //   const explanation = await ESCExplanation.create({
      //     title: 'No Information',
      //     description: 'Default zero rating for new products with no rating',
      //     measure: 0,
      //     escrating: newRating.id,
      //   }).fetch();

      //   // await ESCRating.addToCollection(newRating.id, 'explanation').members(explanations.map(e => e.id));

      //   const result = getResult(newRating, [explanation]);
      //   return { [barcode]: result };
        // return exits.success(null);
      };

    //   const newRating = await ESCRating.create({
    //     calculatedOn: moment.utc().toISOString(),
    //     productPublicId: barcode,
    //     rating: SustainedGradeToRatingMap[match.grade],
    //     // explanation: explanation,
    //     evidence: JSON.stringify(match.result),
    //   }).fetch();

    //   const impacts = match.impacts.map((impact) => ({
    //     title: impact.title,
    //     description: impact.description,
    //     measure: SustainedGradeToRatingMap[impact.grade],
    //     escrating: newRating.id,
    //   }));

    //   const explanations = await ESCExplanation.createEach(impacts).fetch();

    //   // await ESCRating.addToCollection(newRating.id, 'explanation').members(explanations.map(e => e.id));

    //   const result = getResult(newRating, explanations);
    //   return { [barcode]: result };
    // };

    // const ratingsJobsFromWeb = await lazyScheduleRatingsForProductsFromVegiESCApi(inputs.productIds);
    // todo: this needs to request all the barcodes in one go from the esc-api
    // todo: for now return defautl object ratings where ratings objects are stored against product ids..., pass product ids to the helper
    // const resultDictFromWeb: GetProductRatingResult = Object.assign(
    //   {},
    //   ...ratingsJobsFromWeb
    // );
    // const resultFinal = Object.assign(resultDict, resultDictFromWeb);
    const resultFinal = resultDict; // * ignore output of lazyFetch function for now and just fetch ratings that are already calculated in the db

    return exits.success(resultFinal);
  },
};

module.exports = _exports;
