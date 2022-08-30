

module.exports = {
  friendlyName: 'Update Fulfilment Method',

  inputs: {
    openingHours: {
      type: 'json',
      description: 'The opening hours to be added to the vendor',
      required: true
    },
    id: {
      type: 'number',
      description: 'The id of the fulfilment method',
    },
    priceModifier: {
      type: 'number',
      description: 'A positive or negative integer representing the amount of pence to adjust the base price by.'
    },
    slotLength: {
      type: 'number',
      description: 'Slot length in minutes',
      min: 30,
      max: 1440,
    },
    bufferLength: {
      type: 'number',
      min: 0,
      description: 'The required buffer time before booking a slot.'
    },
    orderCutoff: {
      type: 'ref',
      description: 'The time after which no new bookings can be made.'
    },
    maxOrders: {
      type: 'number',
      description: 'The maximum number of orders allowed per slot.'
    }
  },

  exits: {
    success: {
      outputDescription: 'The updated opening hours',
      outputExample: {}
    }
  },

  fn: async function (inputs, exits) {
    // Todo: Authorise this request

    // Update fulfilment method
    let fulfilmentMethod = await FulfilmentMethod.update({id: inputs.id})
    .set({
      priceModifier: inputs.priceModifier,
      slotLength: inputs.slotLength,
      bufferLength: inputs.bufferLength,
      orderCutoff: inputs.orderCutoff,
      maxOrders: inputs.maxOrders,
    });

    // Update all opening hours
    inputs.openingHours.forEach(
      async hours => {
        await OpeningHours.updateOne(hours.id).set(hours);
      }
    );

    return exits.success(fulfilmentMethod);
  }

};
