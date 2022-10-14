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
      statusCode: 200,
      data: null,
      exampleOutput: {
        'data': {
          'collectionMethod': {
            'createdAt': 1661434438245,
            'updatedAt': 1661434438245,
            'id': 2,
            'name': '',
            'description': '',
            'priceModifier': 0,
            'methodType': 'collection',
            'slotLength': 60,
            'bufferLength': 0,
            'orderCutoff': null,
            'maxOrders': 0,
            'vendor': 1,
            'deliveryPartner': null
          },
          'deliveryMethod': {
            'createdAt': 1661434438220,
            'updatedAt': 1661434438220,
            'id': 1,
            'name': '',
            'description': '',
            'priceModifier': 0,
            'methodType': 'delivery',
            'slotLength': 60,
            'bufferLength': 0,
            'orderCutoff': null,
            'maxOrders': 0,
            'vendor': 1,
            'deliveryPartner': null
          },
          'eligibleCollectionDates': {
            'availableDaysOfWeek': [
              'friday'
            ],
            'availableSpecialDates': []
          },
          'eligibleDeliveryDates': {
            'availableDaysOfWeek': [
              'monday',
              'wednesday'
            ],
            'availableSpecialDates': []
          }
        }
      }
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
