/**
 * Account.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import { AccountType, SailsModelDefnType } from '../../scripts/utils';

let _exports: SailsModelDefnType<AccountType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    accountType: {
      type: 'string',
      required: false,
      isIn: ['ethereum', 'bank'],
      allowNull: true,
    },
    walletAddress: {
      type: 'string',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$|^$/,
    },
    verified: {
      type: 'boolean',
      required: false,
      defaultsTo: false,
    },
    imageUrl: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
    bankCardAccountName: {
      type: 'string',
      required: false,
      allowNull: true,
    },
    bankCardNumber: {
      type: 'string',
      required: false,
      regex: /^[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}$|^$/,
      allowNull: true,
    },
    bankCardExpiryDateMonth: {
      type: 'number',
      required: false,
      allowNull: true,
    },
    bankCardExpiryDateYear: {
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
  },
};

module.exports = _exports;
