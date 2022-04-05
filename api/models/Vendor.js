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
      // isIn: ['restaurant', 'shop'],
      defaultsTo: 'restaurant',
      required: false,
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
    imageFd: {
      type: 'string',
      description: 'A description of where the featured image file can be found'
    },
    imageMime: {
      type: 'string',
      description: 'The mime type of the featured image'
    },
    deliveryRestrictionDetails: {
      type: 'string',
      description: 'This is a free text description of the restaurant\'s restrictions, used temporarily.',
      allowNull: true
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
    pickupAddressLineOne: {
      type: 'string',
      allowNull: true
    },
    pickupAddressLineTwo: {
      type: 'string',
      allowNull: true
    },
    pickupAddressCity: {
      type: 'string',
      allowNull: true
    },
    pickupAddressPostCode: {
      type: 'string',
      allowNull: true
    },
    costLevel: {
      type: 'number',
      min: 1,
      max: 3,
      allowNull: true
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5
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
    }
  },

  afterCreate: async function (newlyCreatedRecord, proceed) {
    await sails.helpers.initialiseDeliveryMethods(newlyCreatedRecord.id);

    return proceed();
  }

};

