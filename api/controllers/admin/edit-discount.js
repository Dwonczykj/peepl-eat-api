module.exports = {


  friendlyName: 'Edit discount',


  description: '',


  inputs: {
    id: {
      type: 'number',
      required: true
    },
    code: {
      type: 'string',
    },
    percentage:{
      type: 'number',
      min: 0,
      max: 100
    },
    expiryDateTime: {
      type: 'number'
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

    var updatedDiscount = await Discount.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: updatedDiscount.id
    });

  }


};
