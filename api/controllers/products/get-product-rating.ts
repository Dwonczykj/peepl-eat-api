import axios from 'axios';
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../../api/interfaces/iSails';
import {
  ProductType,
  ProductOptionValueType,
  ESCRatingType,
  ESCExplanationType,
  SustainedAPIChoiceGetProductsResponseType,
  datetimeStrFormat,
  SustainedAPIChoiceGetImpactsResponseType,
} from '../../../scripts/utils';

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

type GetProductRatingInputs = {
  productPublicId: ESCRatingType['productPublicId'];
};

export type GetProductRatingResult = {
  id: number;
  createdAt: number;
  productPublicId: string;
  rating: number;
  evidence: object;
  calculatedOn: Date;
  product: ProductType;
  explanations: sailsModelKVP<ESCExplanationType>[];
};

export type GetProductRatingExits = {
  success: (unusedData: { data: GetProductRatingResult }) => any;
  notFound: (unusedMessage?: { message: string }) => any;
};

module.exports = {
  friendlyName: 'Get product rating',

  description:
    'Get the options for the product as well as the relevant options.',

  inputs: {
    productPublicId: {
      type: 'string',
      description:
        'The public ID string of the product that we want the options for.',
      required: true,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      data: null,
    },
    notFound: {
      statusCode: 404,
      message: 'No match found for product id',
    },
  },

  fn: async function (
    inputs: GetProductRatingInputs,
    exits: GetProductRatingExits
  ) {
    const getResult = <T extends sailsModelKVP<ESCExplanationType> | ESCExplanationType>(
      rating: ESCRatingType,
      explanations: T[]
    ) => {
      return {
        ...rating,
        ...{
          explanations: explanations,
        },
      } as GetProductRatingResult;
    };

    const findMatch = async (name: string, category: string) => {
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

      try {
        const response =
          await instance.get<SustainedAPIChoiceGetProductsResponseType>(
            'products',
            {
              params: queryParameters,
            }
          );

        if (response.status === 200) {
          if (
            !Array.isArray(response.data['products']) ||
            response.data['products'].length < 1
          ) {
            // no similar products found
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
        }
      } catch (err) {
        sails.log.error(err);
        return null;
      }
    };

    // todo: check ESCRatings table for RECENT result information
    let ttl = moment
      .utc()
      .subtract(sails.config.custom.escRatingsTTLDays * 24, 'hours')
      .format(datetimeStrFormat); // e.g. 25/12/2022 17:00

    const ratingsEntries = await ESCRating.find({
      productPublicId: inputs.productPublicId,
      calculatedOn: {
        '>': ttl,
      },
    }).populate('evidence');

    if (ratingsEntries && ratingsEntries.length > 0) {
      // todo use most recent entry
      const rating = ratingsEntries.sort((a, b) =>
        moment.utc(b.calculatedOn).isAfter(moment.utc(a.calculatedOn)) ? -1 : 1
      )[0];
      const explanations = await ESCExplanation.find({
        escrating: rating.id
      });
      
      return exits.success({ data: getResult(rating, explanations) });
    }

    const productOptionValue = await ProductOptionValue.findOne({
      productBarCode: inputs.productPublicId,
    }).populate('option&option.product');

    const productOptionName = productOptionValue.option.product.name;
    const product = await Product.findOne(
      productOptionValue.option.product.id
    ).populate('category');
    const productCategory = product.category.name;

    const productNameVal = `${productOptionName} ${productOptionValue.name} ${productOptionValue.brandName}`;
    let match = await findMatch(productNameVal, productCategory);
    if (!match) {
      match = await findMatch(product.name, productCategory);
    }
    // todo: populate ESCRatings table with result information
    if (!match) {
      return exits.notFound();
    }

    const newRating = await ESCRating.create({
      calculatedOn: moment.utc().toISOString(),
      productPublicId: inputs.productPublicId,
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
    return exits.success({data: result});
  },
};
