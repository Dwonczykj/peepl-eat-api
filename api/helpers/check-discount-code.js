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
      return false;
    }

    if(discount.vendor && (discount.vendor !== inputs.vendorId)){
      return false;
    }

    if(discount.expiryDateTime && discount.expiryDateTime < currentTime){
      return false;
    }

    if(discount.maxUses && discount.timesUsed >= discount.maxUses){
      return false;
    }

    if(!discount.isEnabled) {
      return false;
    }

    // All done.
    return discount;
  }


};

