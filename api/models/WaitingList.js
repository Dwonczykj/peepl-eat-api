/**
 * WaitingList.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    userType: {
      type: 'string',
      required: false,
      defaultsTo: 'unknown',
    },
    origin: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    onboarded: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
    },
    personInFront: {
      type: 'number',
      description: 'the id of the person in front in the queue',
      required: true,
      allowNull: false,
    },
    positionLastCalculatedTime: {
      type: 'ref',
      columnType: 'date',
      required: true,
    },
    order: {
      type: 'number',
      required: true,
    },
    emailUpdates: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
    },
    firebaseRegistrationToken: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  },
};
