declare var Vendor: any;
declare var User: any;
module.exports = {

  friendlyName: 'View vendor menu',

  description: 'Display "Vendor menu" page.',

  inputs: {
    vendorid: {
      type: 'number',
      required: true
    }
  },

  exits: {

    success: {
      statusCode: 200,
    },
    notFound: {
      responseType: 'notFound'
    }

  },


  fn: async function (inputs, exits) {
    var vendor = await Vendor.findOne(inputs.vendorid)
    .populate('products');

    if(!vendor){
      return exits.notFound();
    }

    return exits.success(
      {vendor}
    );

  }


};
