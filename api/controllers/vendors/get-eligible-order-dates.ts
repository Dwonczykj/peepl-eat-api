import { GetEligibleOrderUpdates } from '../../interfaces';

// type sailsVegi = sails & {
//   helpers: {keyof Cloud.setup.methods: }
// };
type sailsVegi = any & {
  helpers: any;
};

declare var sails: sailsVegi;

module.exports = {


  friendlyName: 'Get eligible order dates',


  description: 'Get eligible order dates',


  inputs: {
    vendor: {
      type: 'number',
      required: true
    }
  },

  // inputs: sails.helpers.generateSchema('orders/iGetEligibleOrderUpdates', 'GetEligibleOrderUpdates'),

  exits: {
    success: {
      statuscode: 200,
      data: null,
    }
  },


  fn: async function (inputs: GetEligibleOrderUpdates, exits) {

    var eligibleCollectionDates = { availableDaysOfWeek: [], availableSpecialDates: [] };
    var eligibleDeliveryDates = { availableDaysOfWeek: [], availableSpecialDates: [] };

    var vendor = await Vendor.findOne(inputs.vendor)
      .populate('deliveryFulfilmentMethod&collectionFulfilmentMethod');

    if (vendor.deliveryFulfilmentMethod) {
      eligibleDeliveryDates = await sails.helpers.getAvailableDates(vendor.deliveryFulfilmentMethod.id);
    }

    if (vendor.collectionFulfilmentMethod) {
      eligibleCollectionDates = await sails.helpers.getAvailableDates(vendor.collectionFulfilmentMethod.id);
    }

    return exits.success({data: {
      collectionMethod: vendor.collectionFulfilmentMethod,
      deliveryMethod: vendor.deliveryFulfilmentMethod,
      eligibleCollectionDates,
      eligibleDeliveryDates
    }});
  }


};
