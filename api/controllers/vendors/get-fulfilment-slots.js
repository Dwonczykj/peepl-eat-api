module.exports = {


  friendlyName: 'Get fulfilment slots',


  description: '',


  inputs: {
    vendor: {
      type: 'number',
      required: true
    },
    date: {
      type: 'string',
      required: true,
      regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    // var moment = require('moment');

    // var dt = new moment(inputs.date, 'DD/MM/YYYY'); // Moment version of date
    // var dayOfWeek = dt.format('dddd').toLowerCase(); // e.g. monday

    // TODO: Postcode restrictions

    var deliverySlots = [];
    var collectionSlots = [];

    var vendor = await Vendor.findOne(inputs.vendor)
    .populate('deliveryFulfilmentMethod&collectionFulfilmentMethod');

    if(vendor.deliveryFulfilmentMethod){
      deliverySlots = await sails.helpers.getAvailableSlots(inputs.date, vendor.deliveryFulfilmentMethod.id);
    }

    if(vendor.collectionFulfilmentMethod){
      collectionSlots = await sails.helpers.getAvailableSlots(inputs.date, vendor.collectionFulfilmentMethod.id);
    }

    return {
      collectionMethod: vendor.collectionFulfilmentMethod,
      deliveryMethod: vendor.deliveryFulfilmentMethod,
      collectionSlots,
      deliverySlots
    };
  }


};
