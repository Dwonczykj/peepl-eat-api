declare var OpeningHours: any;
declare var FulfilmentMethod: any;

module.exports = {


  friendlyName: 'Request items from vendor',


  description: 'Request items from vendor',


  inputs: {
    // fulfilmentMethodId: {
    //   type: 'number',
    //   required: true,
    //   description: 'The ID of the fulfilmentMethod which is being requested.'
    // },
    // fulfilmentSlotFrom: {
    //   type: 'string',
    //   required: true,
    //   // description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
    //   // example: '2022-03-24',
    //   // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    // },
    // fulfilmentSlotTo: {
    //   type: 'string',
    //   required: true,
    //   // description: 'The date for which time slots need to be generated. Format YYYY-MM-DD',
    //   // example: '2022-03-24',
    //   // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    // },
    vendor: {
      type: 'number',
      required: true,
    },
    items: {
      type: 'ref',
      description: 'Cart items of type OrderItem',
      required: true
    },
    deliverBefore: {
      type: 'number',
      description: 'a unix timestamp for a delivery slot deadline bound to be converted to string by moment.js',
    },
    deliverAfter: {
      type: 'number',
      description: 'a unix timestamp for a delivery slot start bound to be converted to string by moment.js',
    }
  },


  exits: {
    success: {
      // outputFriendlyName: 'Available slots',
    },
  },


  fn: async function (inputs, exits) {
    //TODO: Implement this function

    const vendor = Vendor.findOne({id:inputs.vendor});

    return exits.notFound();
  }
};
