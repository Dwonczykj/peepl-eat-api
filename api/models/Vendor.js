/**
 * Vendor.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      description: 'The name of the vendor.',
      required: true,
      maxLength: 50
    },
    type: {
      type: 'string',
      description: 'The type of vendor.',
      isIn: ['restaurant', 'shop'],
      defaultsTo: 'restaurant',
      maxLength: 50
    },
    description: {
      type: 'string',
      description: 'A brief description of the vendor.',
      required: false,
      maxLength: 200
    },
    walletAddress: {
      type: 'string',
      description: 'The blockchain wallet address for the vendor. Used to distribute payments from customers.',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/
    },
    imageUrl: {
      type: 'string',
      description: 'A description of where the featured image file can be found',
      required: true
    },
    status: {
      type: 'string',
      isIn: ['active', 'draft', 'inactive'],
      defaultsTo: 'inactive'
    },
    phoneNumber: {
      type: 'string',
      description: 'Phone number of the restaurant.',
      required: true
    },
    // pickupAddressLineOne: {
    //   type: 'string',
    //   allowNull: true
    // },
    // pickupAddressLineTwo: {
    //   type: 'string',
    //   allowNull: true
    // },
    // pickupAddressCity: {
    //   type: 'string',
    //   allowNull: true
    // },
    // pickupAddressPostCode: {
    //   type: 'string',
    //   allowNull: true,
    //   regex: /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/i
    //   // regex: /^([a-zA-Z]){1}([0-9][0-9]|[0-9]|[a-zA-Z][0-9][a-zA-Z]|[a-zA-Z][0-9][0-9]|[a-zA-Z][0-9]){1}([ ])([0-9][a-zA-z][a-zA-z]){1}$/i
    // },
    // pickupAddressLatitude: {
    //   type: 'number',
    //   allowNull: true,
    // },
    // pickupAddressLongitude: {
    //   type: 'number',
    //   allowNull: true,
    // },
    costLevel: {
      type: 'number',
      min: 1,
      max: 3,
      allowNull: true
    },
    rating: { //TODO: Add ratings tables for users to add their ratings so that we can calculate the vendors rating and periodically update this rounded value
      type: 'number',
      min: 0,
      max: 5,
      columnType: 'INT'
    },
    isVegan: {
      type: 'boolean',
      defaultsTo: false
    },
    minimumOrderAmount: {
      type: 'number',
      min: 0,
    },
    platformFee: {
      type: 'number',
      min: 0,
      defaultsTo: 125,
      description: 'The platform fee (in pence) that is charged for this vendor.'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    products: {
      collection: 'product',
      via: 'vendor'
    },
    collectionFulfilmentMethod: {
      model: 'fulfilmentmethod'
    },
    deliveryFulfilmentMethod: {
      model: 'fulfilmentmethod'
    },
    pickupAddress: {
      model: 'address',
    },
    deliveryPartner: {
      model: 'deliverypartner'
    },
    vendorCategories: {
      collection: 'vendorcategory',
      via: 'vendors'
    },
    productCategories: {
      collection: 'productcategory',
      via: 'vendor'
    },
    fulfilmentPostalDistricts: {
      collection: 'postaldistrict',
      via: 'vendors'
    },
    users: {
      collection: 'user',
      via: 'vendor'
    },
  },

  afterCreate: async function (newlyCreatedRecord, proceed) {
    try{
      await sails.helpers.initialiseDeliveryMethods.with({vendor: newlyCreatedRecord.id});
      const generalCategoryGroup = CategoryGroup.findOrCreate({
        name: 'General'
      });
      if (generalCategoryGroup && generalCategoryGroup.id){
        await sails.helpers.createProductCategories.with({
          productCategories: [
            {
              vendor: newlyCreatedRecord.id,
              name: 'General',
              categoryGroup: generalCategoryGroup,
              //todo: upload an image for general and link it here using imageUrl key
            },
          ],
        });
      }
    } catch(err) {
      sails.log.warn(err);
      return proceed(err);
    }

    return proceed();
  }

};

