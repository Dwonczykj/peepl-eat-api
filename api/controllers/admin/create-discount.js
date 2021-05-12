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

    var newDiscount = await Discount.create(inputs).fetch();

    // All done.
    return exits.success({
      id: newDiscount.id
    });

  }


};
