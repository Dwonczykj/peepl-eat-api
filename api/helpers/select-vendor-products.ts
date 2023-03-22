
import { CategoryGroupType, ProductCategoryType, ProductOptionType, ProductOptionValueType, ProductType, SailsActionDefnType, VendorType } from '../../scripts/utils';
import {
  sailsVegi,
} from '../interfaces/iSails';
import { GetProductRatingResult } from './get-product-rating-by-barcodes';

declare var sails: sailsVegi;


export type SelectVendorProductsInputs = {
  vendorId: number;
};

export type RatedProductType = ProductType & {
  rating: GetProductRatingResult['']
};

export type SelectVendorProductsResult = {
  vendor: VendorType & {
    products:RatedProductType[];
  }
} | false;

export type SelectVendorProductsExits = {
  success: (unusedData: SelectVendorProductsResult) => any;
};

const _exports: SailsActionDefnType<
  SelectVendorProductsInputs,
  SelectVendorProductsResult,
  SelectVendorProductsExits
> = {
  friendlyName: 'Select Vendor Products',

  inputs: {
    vendorId: {
      type: 'number',
      required: true,
    },
  },

  exits: {
    success: {
      data: null,
    },
  },

  fn: async function (
    inputs: SelectVendorProductsInputs,
    exits: SelectVendorProductsExits
  ) {

    // var vendor = await Vendor.findOne(vendorid).populate(
    //   'pickupAddress&productCategories&products&products.options&options.values'
    //   // "pickupAddress&productCategories&products&products.category&products.options&options.values"
    // );

    // var products = await Product.find({
    //   vendor: vendorid,
    // }).populate('category&options&options.values');

    // vendor.products = products;

    const vendor = await Vendor.findOne(inputs.vendorId)
      .populate('pickupAddress')
      .populate('productCategories')
      .populate('fulfilmentPostalDistricts')
      .populate('deliveryPartner');

    if (!vendor) {
      return exits.success(false);
    }

    const GET_PRODUCTS_SQL = `
with products as (
	SELECT 
  \`vendor\`.\`createdAt\` AS vendor_createdAt,
  \`vendor\`.\`updatedAt\` AS vendor_updatedAt,
  \`vendor\`.\`id\` AS vendor_id,
  \`vendor\`.\`name\` AS vendor_name,
  \`vendor\`.\`type\` AS vendor_type,
  \`vendor\`.\`description\` AS vendor_description,
  \`vendor\`.\`walletAddress\` AS vendor_walletAddress,
  \`vendor\`.\`imageUrl\` AS vendor_imageUrl,
  \`vendor\`.\`status\` AS vendor_status,
  \`vendor\`.\`phoneNumber\` AS vendor_phoneNumber,
  \`vendor\`.\`costLevel\` AS vendor_costLevel,
  \`vendor\`.\`rating\` AS vendor_rating,
  \`vendor\`.\`collectionFulfilmentMethod\` AS vendor_collectionFulfilmentMethod,
  \`vendor\`.\`deliveryFulfilmentMethod\` AS vendor_deliveryFulfilmentMethod,
  \`vendor\`.\`pickupAddress\` AS vendor_pickupAddress,
  \`vendor\`.\`isVegan\` AS vendor_isVegan,
  \`vendor\`.\`minimumOrderAmount\` AS vendor_minimumOrderAmount,
  \`vendor\`.\`platformFee\` AS vendor_platformFee,
  \`vendor\`.\`deliveryPartner\` AS vendor_deliveryPartner,
  \`product\`.\`createdAt\` AS product_createdAt,
  \`product\`.\`updatedAt\` AS product_updatedAt,
  \`product\`.\`id\` AS product_id,
  \`product\`.\`name\` AS product_name,
  \`product\`.\`description\` AS product_description,
  \`product\`.\`shortDescription\` AS product_shortDescription,
  \`product\`.\`basePrice\` AS product_basePrice,
  \`product\`.\`imageUrl\` AS product_imageUrl,
  \`product\`.\`isAvailable\` AS product_isAvailable,
  \`product\`.\`priority\` AS product_priority,
  \`product\`.\`vendor\` AS product_vendor,
  \`product\`.\`category\` AS product_category,
  \`product\`.\`isFeatured\` AS product_isFeatured,
  \`product\`.\`status\` AS product_status,
  \`product\`.\`ingredients\` AS product_ingredients,
  \`product\`.\`vendorInternalId\` AS product_vendorInternalId,
  \`product\`.\`stockCount\` AS product_stockCount,
  \`product\`.\`brandName\` AS product_brandName,
  \`product\`.\`taxGroup\` AS product_taxGroup,
  \`product\`.\`stockUnitsPerProduct\` AS product_stockUnitsPerProduct,
  \`product\`.\`sizeInnerUnitValue\` AS product_sizeInnerUnitValue,
  \`product\`.\`sizeInnerUnitType\` AS product_sizeInnerUnitType,
  \`product\`.\`productBarCode\` AS product_productBarCode,
  \`product\`.\`supplier\` AS product_supplier,
  \`productcategory\`.\`createdAt\` AS productcategory_createdAt,
  \`productcategory\`.\`updatedAt\` AS productcategory_updatedAt,
  \`productcategory\`.\`id\` AS productcategory_id,
  \`productcategory\`.\`name\` AS productcategory_name,
  \`productcategory\`.\`imageUrl\` AS productcategory_imageUrl,
  \`productcategory\`.\`vendor\` AS productcategory_vendor,
  \`productcategory\`.\`categoryGroup\` AS productcategory_categoryGroup,
  \`categorygroup\`.\`id\` AS categorygroup_id,
  \`categorygroup\`.\`name\` AS categorygroup_name,
  \`categorygroup\`.\`imageUrl\` AS categorygroup_imageUrl,
  \`categorygroup\`.\`forRestaurantItem\` AS categorygroup_forRestaurantItem,
  \`productoption\`.\`createdAt\` AS productoption_createdAt,
  \`productoption\`.\`updatedAt\` AS productoption_updatedAt,
  \`productoption\`.\`id\` AS productoption_id,
  \`productoption\`.\`name\` AS productoption_name,
  \`productoption\`.\`product\` AS productoption_product,
  \`productoption\`.\`isRequired\` AS productoption_isRequired,
  \`productoptionvalue\`.\`createdAt\` AS productoptionvalue_createdAt,
  \`productoptionvalue\`.\`updatedAt\` AS productoptionvalue_updatedAt,
  \`productoptionvalue\`.\`id\` AS productoptionvalue_id,
  \`productoptionvalue\`.\`name\` AS productoptionvalue_name,
  \`productoptionvalue\`.\`description\` AS productoptionvalue_description,
  \`productoptionvalue\`.\`priceModifier\` AS productoptionvalue_priceModifier,
  \`productoptionvalue\`.\`isAvailable\` AS productoptionvalue_isAvailable,
  \`productoptionvalue\`.\`option\` AS productoptionvalue_option
  FROM \`vegi\`.\`vendor\` vendor
	left join \`vegi\`.\`product\` product on vendor.id = product.vendor
	left join \`vegi\`.\`productoption\` productoption on product.id = productoption.product 
	left join \`vegi\`.\`productoptionvalue\` productoptionvalue on productoptionvalue.option = productoption.id 
	left join \`vegi\`.\`productcategory\` productcategory on productcategory.id = product.category 
	left join \`vegi\`.\`categorygroup\` categorygroup on categorygroup.id = productcategory.categoryGroup
)
, esc as (
	select
		products.*,
	  \`escrating\`.\`createdAt\` AS escrating_createdAt,
	  \`escrating\`.\`updatedAt\` AS escrating_updatedAt,
	  \`escrating\`.\`id\` AS escrating_id,
	  \`escrating\`.\`productPublicId\` AS escrating_productPublicId,
	  \`escrating\`.\`rating\` AS escrating_rating,
	  \`escrating\`.\`evidence\` AS escrating_evidence,
	  \`escrating\`.\`calculatedOn\` AS escrating_calculatedOn,
	  \`escrating\`.\`product\` AS escrating_product,
	  \`escexplanation\`.\`createdAt\` AS escexplanation_createdAt,
	  \`escexplanation\`.\`updatedAt\` AS escexplanation_updatedAt,
	  \`escexplanation\`.\`id\` AS escexplanation_id,
	  \`escexplanation\`.\`title\` AS escexplanation_title,
	  \`escexplanation\`.\`description\` AS escexplanation_description,
	  \`escexplanation\`.\`measure\` AS escexplanation_measure,
	  \`escexplanation\`.\`escrating\` AS escexplanation_escrating
  FROM products
    left join \`vegi\`.\`escrating\` escrating on products.product_id = \`escrating\`.\`product\`
	left join \`vegi\`.\`escexplanation\` escexplanation on escrating.id = escexplanation.escrating
    where (1=1) 
		and products.vendor_id = $1
        and (TIMESTAMPDIFF(HOUR, FROM_UNIXTIME(\`escrating\`.\`createdAt\`), UNIX_TIMESTAMP(NOW())) <= 24 or \`escrating\`.\`id\` is null) -- escrating created in the last 24 hours
)
select * from esc order by esc.product_id, esc.escrating_createdAt DESC
`;

    // Send it to the database.
    const productRows = await sails.sendNativeQuery<any>(
          GET_PRODUCTS_SQL,
          [inputs.vendorId]
    );

    if (!productRows || !productRows.rows || productRows.rows.length < 1) {
      return exits.success(false);
    }

    // function uniqueFilter(value, index, self) {
    //   return self.indexOf(value) === index;
    // }

    // const productIds = productRows.rows.map(p => p.product_id).filter(uniqueFilter);

    const products: {
          [productId: string]: ProductType;
        } = {};
    const productOptions: {
          [productId: string]: {
            [productOptionId: string]: ProductOptionType;
          }
        } = {};

    productRows.rows.forEach(row => {
      if (!Object.keys(products).includes(row.product_id.toString())) {
        products[row.product_id] = {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          shortDescription: row.product_shortDescription,
          basePrice: row.product_basePrice,
          imageUrl: row.product_imageUrl,
          isAvailable: Boolean(row.product_isAvailable),
          isFeatured: Boolean(row.product_isFeatured),
          priority: row.product_priority,
          status: row.product_status,
          ingredients: row.product_ingredients,

          vendorInternalId: row.product_vendorInternalId,
          stockCount: row.product_stockCount,
          brandName: row.product_brandName,
          taxGroup: row.product_taxGroup,
          stockUnitsPerProduct: row.product_stockUnitsPerProduct,
          sizeInnerUnitValue: row.product_sizeInnerUnitValue,
          sizeInnerUnitType: row.product_sizeInnerUnitType,
          productBarCode: row.product_productBarCode,
          supplier: row.product_supplier,

          vendor: row.product_vendor,

          category: {
            id: row.productcategory_id,
            name: row.productcategory_name,
            imageUrl: row.productcategory_imageUrl,
            categoryGroup: {
              id: row.categorygroup_id,
              name: row.categorygroup_name,
              imageUrl: row.categorygroup_imageUrl,
              forRestaurantItem: Boolean(row.categorygroup_forRestaurantItem),
            } as CategoryGroupType,
          } as ProductCategoryType,
          options: [],
        };
      }
      if (!Object.keys(productOptions).includes(row.product_id.toString())) {
        productOptions[row.product_id] = {};
      }
      
      if (row.productoptionvalue_option){
        const pov: ProductOptionValueType = {
          id: row.productoptionvalue_id,
          name: row.productoptionvalue_name,
          description: row.productoptionvalue_description,
          priceModifier: row.productoptionvalue_priceModifier,
          isAvailable: Boolean(row.productoptionvalue_isAvailable),
          option: row.productoptionvalue_option,
        };
        if (
          !Object.keys(productOptions[row.product_id.toString()]).includes(
            row.productoptionvalue_option.toString()
          )
        ) {
          productOptions[row.product_id.toString()][
            row.productoptionvalue_option.toString()
          ] = {
            id: row.productoption_id,
            name: row.productoption_name,
            isRequired: row.productoption_isRequired,
            product: products[row.product_id] as any,
            values: [],
          };
        }
        productOptions[row.product_id.toString()][
          row.productoptionvalue_option.toString()
        ]['values'].push(pov);
      }

      products[row.product_id.toString()].options = Object.values(
        productOptions[row.product_id.toString()]
      ) as any;
    });

    // Object.keys(products).forEach(productId => {
    //   products[productId].options = productOptions[productId][] as any;
    // });

    vendor.products = Object.values(products);

    // const productOptionValues: {[k:ProductOptionType['id']]: ProductOptionValueType} = Object.assign(productRows.rows.map(row => {
    //   const pov: ProductOptionValueType = {
    //     id: row.productoptionvalue_id,
    //     name: row.productoptionvalue_name,
    //     description: row.productoptionvalue_description,
    //     priceModifier: row.productoptionvalue_priceModifier,
    //     isAvailable: row.productoptionvalue_isAvailable,
    //     stockCount: row.productoptionvalue_stockCount,
    //     brandName: row.productoptionvalue_brandName,
    //     taxGroup: row.productoptionvalue_taxGroup,
    //     stockUnitsPerProduct: row.productoptionvalue_stockUnitsPerProduct,
    //     sizeInnerUnitValue: row.productoptionvalue_sizeInnerUnitValue,
    //     sizeInnerUnitType: row.productoptionvalue_sizeInnerUnitType,
    //     productBarCode: row.productoptionvalue_productBarCode,
    //     supplier: row.productoptionvalue_supplier,
    //     option: row.productoptionvalue_option,
    //   };
    //   return {[row.productoptionvalue_option]: pov};
    // }));
    // const _productOptions: {[k:ProductType['id']]: ProductOptionType} = Object.assign(productRows.rows.map(row => {
    //   const pov: ProductOptionValueType = {
    //     id: row.productoptionvalue_id,
    //     name: row.productoptionvalue_name,
    //     description: row.productoptionvalue_description,
    //     priceModifier: row.productoptionvalue_priceModifier,
    //     isAvailable: row.productoptionvalue_isAvailable,
    //     stockCount: row.productoptionvalue_stockCount,
    //     brandName: row.productoptionvalue_brandName,
    //     taxGroup: row.productoptionvalue_taxGroup,
    //     stockUnitsPerProduct: row.productoptionvalue_stockUnitsPerProduct,
    //     sizeInnerUnitValue: row.productoptionvalue_sizeInnerUnitValue,
    //     sizeInnerUnitType: row.productoptionvalue_sizeInnerUnitType,
    //     productBarCode: row.productoptionvalue_productBarCode,
    //     supplier: row.productoptionvalue_supplier,
    //     option: row.productoptionvalue_option,
    //   };
    //   return {[row.productoptionvalue_option]: pov};
    // }));

    // const _products = productRows.rows.map((productRow) => {
    //   const product: ProductType = {
    //     id: productRow.product_id,
    //     name: productRow.product_name,
    //     description: productRow.product_description,
    //     shortDescription: productRow.product_shortDescription,
    //     basePrice: productRow.product_basePrice,
    //     imageUrl: productRow.product_imageUrl,
    //     isAvailable: productRow.product_isAvailable,
    //     isFeatured: productRow.product_isFeatured,
    //     priority: productRow.product_priority,
    //     status: productRow.product_status,
    //     ingredients: productRow.product_ingredients,

    //     vendor: productRow.product_vendor,

    //     category: {
    //       id: productRow.productcategory_id,
    //       name: productRow.productcategory_name,
    //       imageUrl: productRow.productcategory_imageUrl,
    //       categoryGroup: {
    //         id: productRow.categorygroup_id,
    //         name: productRow.categorygroup_name,
    //         imageUrl: productRow.categorygroup_imageUrl,
    //         forRestaurantItem: productRow.categorygroup_forRestaurantItem,
    //       } as CategoryGroupType,
    //     } as ProductCategoryType,
    //     options: productRow.product_,
    //   };
    // })

    // const vendorRow = productRows.rows[0]; // can only be one as primary key
    // const vendorProductsRows = productRows; // we need to get distinct products, there will be multiple rows per product because of the ratings per product etc

    // const vendor: VendorType = {
    //   id: vendorRow.vendor_id,
    //   name: vendorRow.vendor_name,
    //   type: vendorRow.vendor_type,
    //   phoneNumber: vendorRow.vendor_phoneNumber,
    //   costLevel?: vendorRow.vendor_costLevel,
    //   rating: vendorRow.vendor_rating,
    //   isVegan: vendorRow.vendor_isVegan,
    //   minimumOrderAmount: vendorRow.vendor_minimumOrderAmount,
    //   platformFee: vendorRow.vendor_platformFee,
    //   status: vendorRow.vendor_status,
    //   walletAddress: vendorRow.vendor_walletAddress,
    //   description: vendorRow.vendor_description,
    //   imageUrl: vendorRow.vendor_imageUrl,

    //   pickupAddress: {
    //     id: vendorRow.address_id,
    //     label: vendorRow.address_label,
    //     addressLineOne: vendorRow.address_addressLineOne,
    //     addressLineTwo: vendorRow.address_addressLineTwo,
    //     addressTownCity: vendorRow.address_addressTownCity,
    //     addressPostCode: vendorRow.address_addressPostCode,
    //     addressCountryCode: vendorRow.address_addressCountryCode,
    //     latitude: vendorRow.address_latitude,
    //     longitude: vendorRow.address_longitude,
    //   },
    //   deliveryPartner: {
    //     id: vendorRow.deliverypartner_id,
    //     name: string;
    //     email: string;
    //     walletAddress: string;
    //     phoneNumber: string;
    //     type?: 'bike' | 'electric';
    //     imageUrl: string;
    //     status: StatusLiteral;
    //     deliversToPostCodes: Array<PostalOutCode>;
    //     rating: number;
    //   },
    //   deliveryFulfilmentMethod: {
    //     id: number;
    //     methodType: 'delivery' | 'collection';
    //     slotLength: number;
    //     bufferLength: number;
    //     orderCutoff: string;
    //     maxOrders: number;
    //     maxDeliveryDistance?: number | null;
    //     priceModifier: number;
    //     vendor?: _VendorTypeHidden;
    //     deliveryPartner?: _DeliveryPartnerTypeHidden;
    //     openingHours?: _OpeningHoursTypeHidden;
    //     fulfilmentOrigin?: _AddressTypeHidden;
    //   },
    //   collectionFulfilmentMethod: {

    //   },
    //   products: Array<_ProductTypeHidden>;
    //   vendorCategories: Array<VendorCategoryType>; // Cafes
    //   productCategories: Array<_ProductCategoryTypeHidden>;
    //   fulfilmentPostalDistricts: Array<PostalDistrictType>;
    //   users: [];
    // }

    // const product = await Product.findOne({ id: vendorRow.id }).populate(
    //   'vendor&category&options'
    // );

    try {
      const productRatings =
        await sails.helpers.getProductRatingByBarcodes.with({
          allowFetch: false,
          // productBarcodes: (vendor.products as ProductType[]).flatMap(
          //   (product) =>
          //     product.options.flatMap((option) =>
          //       option.values.map(
          //         (productOptionValue) => productOptionValue.productBarCode
          //       )
          //     )
          // ),
          productIds: vendor.products.map(p=>p.id),
        });

      //todo: Each ProductOptionValue within a Product needs to be returned with ESCRating

      (vendor.products as any) = (vendor.products as ProductType[]).map(
        (product) =>
          Object.assign(
            product,
            {rating: productRatings[product.productBarCode] || {}}
          )
      );
      // (vendor.products as any) = (vendor.products as ProductType[]).flatMap(
      //   (product) =>
      //     product.options.flatMap((option) =>
      //       option.values.map((productOptionValue) =>
      //         Object.assign(
      //           productOptionValue,
      //           productRatings[product.productBarCode] || {}
      //         )
      //       )
      //     )
      // );
    } catch (error) {
      sails.log.error(error);
    }

    return exits.success({vendor});
  },
};

module.exports = _exports;
