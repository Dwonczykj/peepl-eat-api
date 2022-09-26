/**
 * DeliveryPartner.js
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
      description: 'The name of the Delivery Partner.',
      required: true,
      maxLength: 50
    },
    email:{
      type: 'string',
      description: 'The email of the Delivery Partner.',
      required: true,
      isEmail: true,
      maxLength: 50
    },
    phoneNumber: {
      type: 'string',
      description: 'Phone number of the Delivery Partner.',
      required: true,
      maxLength: 20
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'inactive'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    deliveryFulfilmentMethod: {
      model: 'FulfilmentMethod',
    }
  },

  afterCreate: async function (newlyCreatedRecord, proceed) {
    await sails.helpers.initialiseDeliveryMethods.with({deliveryPartner: newlyCreatedRecord.id});

    return proceed();
  }

};

