/**
 * transaction.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */


import {
  SailsModelDefnType,
  TransactionType,
} from '../../scripts/utils';

let _exports: SailsModelDefnType<TransactionType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    timestamp: {
      type: 'number',
      required: true,
    },
    amount: {
      type: 'number',
      required: true,
    },
    currency: {
      type: 'string',
      required: true,
    },
    status: {
      type: 'string',
      required: false,
    },
    remoteJobId: {
      type: 'string',
      required: false,
      allowNull: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    receiver: {
      model: 'account',
      required: true,
    },
    payer: {
      model: 'account',
      required: true,
    },
    order: {
      model: 'order',
    },
  },
};

module.exports = _exports;
