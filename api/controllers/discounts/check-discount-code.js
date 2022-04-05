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
    var isValid = await sails.helpers.checkDiscountCode(discountCode);

    if(!isValid) {
      return exits.notFound();
    }

    // All done.
    return exits.success({discount: isValid});

  }


};
