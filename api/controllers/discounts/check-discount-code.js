module.exports = {


  friendlyName: 'Check discount code',


  description: 'Checks the validity of the discount code and, if valid, returns the details.',


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
    notFound: {
      responseType: 'notFound'
    },
    expiredCode: {
      responseType: 'badRequest'
    }
  },


  fn: async function ({discountCode, vendorId}, exits) {
    var discountObj = await sails.helpers.checkDiscountCode.with({
      discountCode: discountCode,
      vendorId: vendorId,
    });

    if(!discountObj) {
      return exits.notFound();
    }

    // All done.
    return exits.success({discount: discountObj});

  }


};
