module.exports = {


  friendlyName: 'Check discount code',


  description: 'Checks the validity of the discount code and, if valid, returns the details.',


  inputs: {
    discountCode: {
      type: 'string',
      required: true
    }
  },


  exits: {
    notFound: {
      responseType: 'notFound'
    },
    expiredCode: {
      responseType: 'badRequest'
    }
  },


  fn: async function ({discountCode}, exits) {
    discountCode = discountCode.toUpperCase();

    var discount = await Discount.findOne({code: discountCode});
    var currentTime = new Date().getTime();

    if(!discount){
      return exits.notFound();
    }

    if(discount.expiryDateTime && discount.expiryDateTime < currentTime){
      return exits.expiredCode({message: 'That code has expired'});
    }

    if(discount.maxUses && discount.timesUsed >= discount.maxUses){
      return exits.expiredCode({message: 'That code has been used too many times.'});
    }

    if(!discount.isEnabled) {
      return exits.notFound();
    }

    // All done.
    return exits.success({discount});

  }


};
