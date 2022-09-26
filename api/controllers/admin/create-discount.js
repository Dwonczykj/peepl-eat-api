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
    duplicateCode: {
      statusCode: 409,
    }
  },


  fn: async function (inputs, exits) {
    let user = await User.findOne(this.req.session.userId);

    if(!user.isSuperAdmin){
      inputs.vendor = user.vendor;
    }

    inputs.code = inputs.code.toUpperCase();

    var newDiscount = await Discount.create(inputs).fetch()
    .intercept('E_UNIQUE', 'duplicateCode');

    // All done.
    return exits.success({
      id: newDiscount.id
    });

  }


};
