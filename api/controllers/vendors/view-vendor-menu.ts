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
      'products&products.category&categoryGroup'
    );

    
    try {
      const productRatings = await sails.helpers.getProductRatingByBarcodes.with({
        allowFetch: false,
        productIds: vendor.products.map(p=>p.id),
        // productBarcodes: (vendor.products as ProductType[]).flatMap(product => product.options.flatMap(option => option.values.map(productOptionValue => productOptionValue.productBarCode)))
      });
  
      //todo: Each ProductOptionValue within a Product needs to be returned with ESCRating
  
      // (vendor.products as any) = (vendor.products as ProductType[]).flatMap(
      //   (product) =>
      //     product.options.flatMap((option) =>
      //       option.values.map(
      //         (productOptionValue) => Object.assign(productOptionValue, productRatings[product.productBarCode] || {})
      //       )
      //     )
      // );
      (vendor.products as any) = (vendor.products as ProductType[]).map(
        (product) =>
          Object.assign(product, {
            rating: productRatings[product.productBarCode] || {},
          })
      );
      
    } catch (error) {
      sails.log.error(`${error}`);
    }

    if(!vendor){
      return exits.notFound();
    }

    return exits.success({ vendor, userRole: this.req.session.userRole });

  }


};
