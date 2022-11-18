/**
 * Address.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    label: {
      type: 'string',
      description: 'The name/label of the address.',
      defaultsTo: '',
    },
    addressLineOne: {
      type: 'string',
      required: true,
    },
    addressLineTwo: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    addressTownCity: {
      type: 'string',
      required: true,
    },
    addressPostCode: {
      type: 'string',
      required: true,
      regex:
        /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/i,
    },
    addressCountryCode: {
      type: 'string',
      required: false,
      defaultsTo: 'UK',
    },
    latitude: {
      type: 'number',
      required: false,
      allowNull: true,
    },
    longitude: {
      type: 'number',
      required: false,
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
    user: {
      model: 'user',
    },
  },

  // afterCreate: async function (newlyCreatedRecord, proceed) {
  //   await DeliveryPartner.updateOne(newlyCreatedRecord.deliveryPartner).set({
  //     deliveryFulfilmentMethod: newlyCreatedRecord.id,
  //   });
  //   return proceed();
  // },
};
