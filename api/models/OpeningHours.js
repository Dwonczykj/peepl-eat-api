/**
 * OpeningHours.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const moment = require('moment');
module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    dayOfWeek: {
      type: 'string',
      isIn: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
      // required: true
    },
    specialDate: {
      type: 'ref',
      columnType: 'date',
      description: 'Specific date override - for example Christmas day',
      // example: "2022-03-24",
      // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
      // unique: true
    },
    openTime: {
      type: 'ref',
      columnType: 'time',
    },
    closeTime: {
      type: 'ref',
      columnType: 'time',
    },
    timezone: {
      type: 'number',
      min: -12,
      max: 12,
      columnType: 'INT',
      defaultsTo: 0, // (GMT)
    },
    isOpen: {
      type: 'boolean',
      defaultsTo: false,
    },
    logicId: {
      type: 'string',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    fulfilmentMethod: {
      model: 'fulfilmentMethod',
    },
  },

  beforeCreate: async function (newRecord, proceed) {
    let openTime;
    let closeTime;
    const sign = newRecord.timezone < 0 ? '-' : '+';
    const leadingZero = Math.abs(newRecord.timezone) >= 10 ? '0' : '';

    try {
      openTime = moment
        .utc(
          `${newRecord.openTime} ${sign}${leadingZero}${Math.abs(
            newRecord.timezone
          )}:00`,
          'HH:mm Z'
        )
        .format('HH:mm Z');
    } catch (error) {
      sails.log.warn(
        `Unable to set timezone for opening hours openTime: ${newRecord.openTime} with timezone: ${newRecord.timezone}: ${error}`
      );
    }
    try {
      closeTime = moment
        .utc(
          `${newRecord.closeTime} ${sign}${leadingZero}${Math.abs(
            newRecord.timezone
          )}:00`,
          'HH:mm Z'
        )
        .format('HH:mm Z');
    } catch (error) {
      sails.log.warn(
        `Unable to set timezone for opening hours closeTime: ${newRecord.closeTime} with timezone: ${newRecord.timezone}: ${error}`
      );
    }
    newRecord.logicId = [
      newRecord.isOpen ? 1 : 0,
      newRecord.specialDate ? 's' : 'w',
      newRecord.specialDate || newRecord.dayOfWeek.substring(0, 3),
      openTime || `${newRecord.openTime} ${newRecord.timezone}:00`,
      closeTime || `${newRecord.closeTime} ${newRecord.timezone}:00`,
    ].join('_');

    return proceed();
  },

  afterCreate: async function (newlyCreatedRecord, proceed) {
    if (newlyCreatedRecord.fulfilmentMethod) {
      try {
        await FulfilmentMethod.addToCollection(
          newlyCreatedRecord.fulfilmentMethod,
          'openingHours'
        ).members([newlyCreatedRecord.id]);
      } catch (error) {
        return proceed(error);
      }
    }

    return proceed();
  },
};

