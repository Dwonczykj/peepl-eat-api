/**
 * ProductSuggestion.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
import { v4 as uuidv4 } from 'uuid';
import { ESCSourceType, SailsModelDefnType } from '../../scripts/utils';

let _exports: SailsModelDefnType<ESCSourceType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: 'string',
      required: true,
      unique: true,
    },
    type: {
      type: 'string',
      required: true,
      isIn: ['database', 'api', 'webpage'],
    },
    domain: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    credibility: {
      type: 'number',
      required: false,
      min: 0,
      max: 1,
      defaultsTo: 0,
    },
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  },

  // beforeCreate: function (valuesToSet, proceed) {
  //   valuesToSet.publicUid = uuidv4();
  //   return proceed();
  // },
};

module.exports = _exports;
