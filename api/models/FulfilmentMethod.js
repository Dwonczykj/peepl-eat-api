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
      description:
        'A positive or negative integer representing the amount of pence to adjust the base price by.',
    },
    // TODO: Change restrictions to dynamic based on vendor co-ords and radius
    methodType: {
      type: 'string',
      isIn: ['delivery', 'collection'],
      defaultsTo: 'delivery',
    },
    slotLength: {
      type: 'number',
      description: 'Slot length in minutes',
      min: 30,
      max: 1440,
      defaultsTo: 60,
    },
    bufferLength: {
      type: 'number',
      min: 0,
      description: 'The required buffer time before booking a slot.',
    },
    orderCutoff: {
      type: 'ref',
      columnType: 'time',
      description: 'The time after which no new bookings can be made.',
    },
    maxOrders: {
      type: 'number',
      description: 'The maximum number of orders allowed per slot.',
    },
    maxDeliveryDistance: {
      type: 'number',
      description: 'Max Distance (by road) in KILOMETERS that a FulfilmentMethod will fulfill',
      allowNull: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    vendor: {
      model: 'vendor',
    },
    deliveryPartner: {
      model: 'deliveryPartner',
    },
    openingHours: {
      collection: 'openingHours',
      via: 'fulfilmentMethod',
    },
    fulfilmentOrigin: {
      model: 'address',
      description: 'Origin Address for deliveries that can be used by vendors to determine delivery distances, particularly if delivery not from store address.',
    },
  },

  // afterCreate: async function (newlyCreatedRecord, proceed) {
  //   await DeliveryPartner.updateOne(newlyCreatedRecord.deliveryPartner).set({
  //     deliveryFulfilmentMethod: newlyCreatedRecord.id,
  //   });
  //   return proceed();
  // },
};

