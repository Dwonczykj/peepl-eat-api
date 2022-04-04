module.exports = {


  friendlyName: 'Create discount',


  description: '',


  inputs: {
    code: {
      type: 'string',
      required: true
    },
    percentage:{
      type: 'number',
      min: 0,
      max: 100,
      required: true
    },
    expiryDateTime: {
      type: 'number',
    },
    maxUses: {
      type: 'number'
    },
    isEnabled: {
      type: 'boolean'
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    inputs.code = inputs.code.toUpperCase();

    // TODO: Handling uniqueness error from database query
    var newDiscount = await Discount.create(inputs).fetch()
    .intercept('E_UNIQUE', 'duplicateCode');

    // All done.
    return exits.success({
      id: newDiscount.id
    });

  }


};
