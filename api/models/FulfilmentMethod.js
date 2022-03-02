/**
 * FulfilmentMethod.js
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
      description: 'The name of the delivery method.',
    },
    description: {
      type: 'string',
      description: 'A brief description of the shipping method.',
    },
    priceModifier: {
      type: 'number',
      description: 'A positive or negative integer representing the amount of pence to adjust the base price by.'
    },
    // TODO: Change restrictions to dynamic based on vendor co-ords and radius
    postCodeRestrictionRegex: {
      type: 'string',
      description: 'A regular expression specifying which postcodes are eligible for this delivery method.'
    },
    methodType: {
      type: 'string',
      isIn: ['delivery', 'collection'],
      defaultsTo: 'delivery'
    },
    slotLength: {
      type: 'number',
      description: 'Slot length in minutes',
      min: 0,
      max: 1440
    },
    bufferLength: {
      type: 'number',
      min: 0,
      description: 'The required buffer time before booking a slot.'
    },
    maxOrders: {
      type: 'number',
      description: 'The maximum number of orders allowed per slot.'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
      required: true
    },
    openingHours: {
      collection: 'openingHours',
      via: 'fulfilmentMethod'
    }
  },

};

