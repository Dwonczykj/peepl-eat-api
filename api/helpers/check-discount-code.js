module.exports = {


  friendlyName: 'Check discount code',


  description: '',


  inputs: {
    discountCode: {
      type: 'string',
      required: true
    },
    vendorId: {
      type: 'number',
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    var discountCode = inputs.discountCode.toUpperCase();
    var discount = await Discount.findOne({code: discountCode});
    var currentTime = new Date().getTime();

    if(!discount){
      return exits.success(false);
    }

    if(discount.vendor && (discount.vendor !== inputs.vendorId)){
      return exits.success(false);
    }

    if(discount.expiryDateTime && discount.expiryDateTime < currentTime){
      return exits.success(false);
    }

    if(discount.maxUses && discount.timesUsed >= discount.maxUses){
      return exits.success(false);
    }

    if(!discount.isEnabled) {
      return exits.success(false);
    }

    // All done.
    return exits.success(discount);
  }


};

