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
      description: 'The name of the courier.',
      required: true,
      unique: true,
      maxLength: 50
    },
    type: {
      type: 'string',
      description: 'The type of courier.',
      isIn: ['bike', 'electric'],
      defaultsTo: 'bike',
    },
    description: {
      type: 'string',
      description: 'A brief description of the courier.',
      required: false,
      maxLength: 200
    },
    walletAddress: {
      type: 'string',
      description: 'The blockchain wallet address for the courier. Used to distribute payments from vendors.',
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
      description: 'Phone number of the courier hq.',
    },
    email: {
      type: 'string',
      description: 'Email of the courier hq.',
      required: true,
      unique: true,
    },
    deliversToPostCodes: {
      type: 'json',
      defaultsTo: [],
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5,
      columnType: 'INT'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    users: { // a collection of users that belong to a vendor
      collection: 'user',
      via: 'courier' // NOTE: A collection of users that joins via the user.courier property on the user model -> https://sailsjs.com/documentation/concepts/models-and-orm/associations/reflexive-associations
    },
  },

  // afterCreate: async function (newlyCreatedRecord, proceed) {
  //   await sails.helpers.initialiseDeliveryMethods(newlyCreatedRecord.id);

  //   return proceed();
  // }

};

