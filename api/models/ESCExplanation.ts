/**
 * ESCRating.ts
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

import { ESCExplanationType } from "../../scripts/utils";
import { SailsModelDefnType } from '../../scripts/utils';

let _exports: SailsModelDefnType<ESCExplanationType> = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    title: {
      type: 'string',
      required: true,
      description:
        'The headline for the explanatory reason that contributes to the products aggregated esc measure',
    },
    measure: {
      type: 'number',
      required: true,
      min: 0,
      max: 5,
    },
    reasons: {
      type: 'json',
      required: false,
      defaultsTo: [],
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
    evidence: {
      type: 'json',
      required: true,
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    escrating: {
      model: 'escrating',
    },
    escsource: {
      model: 'escsource',
    },
  },

  // afterCreate: async function (newlyCreatedRecord, proceed) {
  //   await DeliveryPartner.updateOne(newlyCreatedRecord.deliveryPartner).set({
  //     deliveryFulfilmentMethod: newlyCreatedRecord.id,
  //   });
  //   return proceed();
  // },
};

module.exports = _exports;
