/**
 * DeliveryPartner.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const FulfilmentMethod = require("./FulfilmentMethod");

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      description: 'The name of the Delivery Partner.',
      required: true,
      unique: true,
      maxLength: 50,
    },
    email: {
      type: 'string',
      description: 'The email of the Delivery Partner.',
      required: true,
      isEmail: true,
      maxLength: 50,
    },
    phoneNumber: {
      type: 'string',
      description: 'Phone number of the Delivery Partner.',
      required: true,
      maxLength: 20,
    },
    type: {
      type: 'string',
      description: 'The type of delivery partner.',
      isIn: ['bike', 'electric'],
      defaultsTo: 'bike',
    },
    description: {
      type: 'string',
      description: 'A brief description of the delivery partner.',
      required: false,
      maxLength: 200,
    },
    walletAddress: {
      type: 'string',
      description:
        'The blockchain wallet address for the delivery partner. Used to distribute payments from vendors.',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
    imageUrl: {
      type: 'string',
      description:
        'A description of where the featured image file can be found',
      required: false,
      allowNull: true,
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'inactive',
    },
    deliversToPostCodes: {
      // type:
      //   sails.config.datastores.default.adapter === 'sails-postgresql'
      //     ? 'string'
      //     : 'json',
      // defaultsTo:
      //   sails.config.datastores.default.adapter === 'sails-postgresql'
      //     ? ''
      //     : [],
      type: 'json',
      defaultsTo: [],
    },
    rating: {
      type: 'number',
      min: 0,
      max: 5,
      columnType: 'INT',
      defaultsTo: 5,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    deliveryFulfilmentMethod: {
      model: 'FulfilmentMethod',
    },
    users: {
      // a collection of users that belong to a delivery partner
      collection: 'user',
      via: 'deliveryPartner', // NOTE: A collection of users that joins via the user.deliveryPartner property on the user model -> https://sailsjs.com/documentation/concepts/models-and-orm/associations/reflexive-associations
    },
  },

  // beforeCreate: async function (deliveryPartnerDraft, proceed) {
  //   return proceed();
  // },

  afterCreate: async function (newlyCreatedRecord, proceed) {
    if (!newlyCreatedRecord.deliveryFulfilmentMethod) {
      try {
        await sails.helpers.initialiseDeliveryMethods.with({
          deliveryPartner: newlyCreatedRecord.id,
        });
      } catch (error) {
        sails.log.error(error);
        return proceed(error);
      }
    } else {
      const fm = await FulfilmentMethod.findOne(
        newlyCreatedRecord.deliveryFulfilmentMethod
      );
      if (!fm) {
        const error = new Error(
          'Bad Fulfilment Method Passed to DeliveryPartner.create'
        );
        sails.log.error(error);
        return proceed(error);
      }
    }
    return proceed();
  },
};

