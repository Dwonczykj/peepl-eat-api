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
    let user = await User.findOne(this.req.session.userId);
    let discount = await Discount.findOne(inputs.id);

    if(!user.isSuperAdmin){
      if(discount.vendor !== user.vendor){
        return exits.error('You do not have permission to edit this discount');
      }
    }

    inputs.code = inputs.code.toUpperCase();

    var updatedDiscount = await Discount.updateOne(inputs.id).set(inputs);

    // All done.
    return exits.success({
      id: updatedDiscount.id
    });

  }


};
