// import {
//   ProductSuggestionType, SailsActionDefnType,
// } from '../../../scripts/utils';
// import { SailsModelType, sailsModelKVP } from '../../interfaces/iSails';

// declare var ProductSuggestion: SailsModelType<ProductSuggestionType>;

// type CreateProductSuggestionInput = {
//   name: ProductSuggestionType['name'];
//   store: ProductSuggestionType['store'];
//   qrCode: ProductSuggestionType['qrCode'];
//   additionalInformation: ProductSuggestionType['additionalInformation'];
//   productProcessed: ProductSuggestionType['productProcessed'];
//   imageUrls: sailsModelKVP<ProductSuggestionType>['imageUrls'];
// };
// type CreateProductSuggestionResponse = {
//   productSuggestion: ProductSuggestionType;
// };
// type CreateProductSuggestionExits = {
//   success: (
//     unusedArg: CreateProductSuggestionResponse
//   ) => CreateProductSuggestionResponse;
//   successJSON: (
//     unusedResult: CreateProductSuggestionResponse
//   ) => CreateProductSuggestionResponse;
//   notFound: () => void;
//   error: (unusedErr: Error | String) => void;
//   badRequest: (unusedErr: Error | String) => void;
// };

// const _exports: SailsActionDefnType<
//   CreateProductSuggestionInput,
//   CreateProductSuggestionResponse,
//   CreateProductSuggestionExits
// > = {
//   friendlyName: 'Create product category',

//   description: '',

//   inputs: {
//     name: {
//       type: 'string',
//       required: true,
//       description: 'The name of the product',
//       maxLength: 150,
//     },
//     store: {
//       type: 'string',
//       required: true,
//       description: 'The Retailer Name for the product',
//       maxLength: 150,
//     },
//     qrCode: {
//       type: 'string',
//       required: true,
//       maxLength: 50,
//     },
//     additionalInformation: {
//       type: 'string',
//       required: true,
//     },
//     productProcessed: {
//       type: 'boolean',
//       required: true,
//     },
//     imageUrls: {
//       type: 'ref',
//       required: true,
//     }
//   },

//   exits: {
//     success: {
//       description: 'New product category created.',
//       statusCode: 200,
//     },
//     successJSON: {
//       statusCode: 200,
//     },
//     notFound: {
//       statusCode: 404,
//       responseType: 'notFound',
//     },
//     error: {
//       statusCode: 400,
//     },
//     badRequest: {
//       statusCode: 400,
//     },
//   },

//   fn: async function (
//     inputs: CreateProductSuggestionInput,
//     exits: CreateProductSuggestionExits
//   ) {
    
//     const qrCodeRe = RegExp(/^[0-9]+$/);

//     if (!inputs.name) {
//       return exits.badRequest('Bad Product Name');
//     } else if (!inputs.qrCode || !qrCodeRe.test(inputs.qrCode)) {
//       return exits.badRequest('Bad QR Code for Product');
//     } else if (!inputs.additionalInformation) {
//       return exits.badRequest(
//         'Bad Additional Information supplied for Product Suggestion'
//       );
//     } else if (!inputs.imageUrls || inputs.imageUrls.length < 1) {
//       return exits.badRequest(
//         'Bad Additional Information supplied for Product Suggestion'
//       );
//     }

//     const created = await ProductSuggestion.create({
//       name: inputs.name,
//       qrCode: inputs.qrCode,
//       store: inputs.store,
//       additionalInformation: inputs.additionalInformation,
//       productProcessed: inputs.productProcessed,
//     }).fetch();
//     if(!created){
//       return exits.notFound();
//     }
//     return exits.success({
//       productSuggestion: created
//     });
//   },
// };

// module.exports = _exports;
