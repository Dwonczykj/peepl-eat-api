import { SailsModelType, sailsVegi } from "../../../api/interfaces/iSails";
import { ProductType, VendorType } from "../../../scripts/utils";

declare var Vendor: SailsModelType<VendorType>;
declare const sails: sailsVegi;
module.exports = {

  friendlyName: 'View vendor menu [DEPRECATED]',

  description: 'Display "Vendor menu" page.',

  inputs: {
    vendorid: {
      type: 'number',
      required: true
    }
  },

  exits: {

    success: {
      statusCode: 200,
    },
    notFound: {
      responseType: 'notFound'
    }

  },


  fn: async function (inputs, exits) {
    var vendor = await Vendor.findOne(inputs.vendorid).populate(
      'fulfilmentPostalDistricts&productCategories'
    ).populate(
      'products&products.category&products.category.categoryGroup'
    );

    
    try {
      const productRatings = await sails.helpers.getProductRatingByBarcodes.with({
        productBarcodes: (vendor.products as ProductType[]).flatMap(product => product.options.flatMap(option => option.values.map(productOptionValue => productOptionValue.productBarCode)))
      });
  
      //todo: Each ProductOptionValue within a Product needs to be returned with ESCRating
  
      (vendor.products as any) = (vendor.products as ProductType[]).flatMap(
        (product) =>
          product.options.flatMap((option) =>
            option.values.map(
              (productOptionValue) => Object.assign(productOptionValue, productRatings[productOptionValue.productBarCode] || {})
            )
          )
      );
    } catch (error) {
      sails.log.error(error);
    }

    if(!vendor){
      return exits.notFound();
    }

    sails.log.info(vendor.products);

    return exits.success(
      {vendor}
    );

  }


};
