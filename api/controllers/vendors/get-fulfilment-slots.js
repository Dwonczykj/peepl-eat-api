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
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    // var moment = require('moment');

    // var dt = new moment(inputs.date, 'DD/MM/YYYY'); // Moment version of date
    // var dayOfWeek = dt.format('dddd').toLowerCase(); // e.g. monday

    var deliverySlots = [];
    var collectionSlots = [];

    var deliveryFulfilmentMethod = await FulfilmentMethod.find({vendor: inputs.vendor, methodType: 'delivery'}).limit(1);
    if(deliveryFulfilmentMethod.length > 0){
      deliverySlots = await sails.helpers.getAvailableSlots(inputs.date, deliveryFulfilmentMethod[0].id);
    }

    var collectionFulfilmentMethod = await FulfilmentMethod.find({vendor: inputs.vendor, methodType: 'collection'}).limit(1);
    if(collectionFulfilmentMethod.length > 0){
      collectionSlots = await sails.helpers.getAvailableSlots(inputs.date, collectionFulfilmentMethod[0].id);
    }


    // All done.
    return {
      deliverySlots,
      collectionSlots
    };

  }


};
