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

    var deliverySlots = [];
    var collectionSlots = [];

    var vendor = await Vendor.findOne(inputs.vendor)
    .populate('deliveryFulfilmentMethod&collectionFulfilmentMethod&deliveryPartner');

    let collectionFulfilmentMethod = vendor.collectionFulfilmentMethod;
    let deliveryFulfilmentMethod = vendor.deliveryFulfilmentMethod;

    // If the vendor has a delivery partner associated with it, then we need to get the delivery slots for that partner.
    if(vendor.deliveryPartner && vendor.deliveryPartner.status === 'active') {
      var deliveryPartner = await DeliveryPartner.findOne(vendor.deliveryPartner)
      .populate('deliveryFulfilmentMethod');

      deliverySlots = await sails.helpers.getAvailableSlots(inputs.date, deliveryPartner.deliveryFulfilmentMethod.id);
      deliveryFulfilmentMethod = deliveryPartner.deliveryFulfilmentMethod;
    } else if(vendor.deliveryFulfilmentMethod){
      deliverySlots = await sails.helpers.getAvailableSlots(inputs.date, vendor.deliveryFulfilmentMethod.id);
    }

    if(vendor.collectionFulfilmentMethod){
      collectionSlots = await sails.helpers.getAvailableSlots(inputs.date, vendor.collectionFulfilmentMethod.id);
    }

    return {
      collectionMethod: collectionFulfilmentMethod,
      deliveryMethod: deliveryFulfilmentMethod,
      collectionSlots,
      deliverySlots
    };
  }


};
