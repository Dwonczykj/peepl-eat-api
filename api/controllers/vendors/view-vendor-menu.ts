declare var Vendor: any;
module.exports = {

  friendlyName: 'View vendor menu [DEPRECATED]',

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
    var vendor = await Vendor.findOne(inputs.vendorid).populate(
      'fulfilmentPostalDistricts&products&products.category&products.category.categoryGroup'
    );

    if(!vendor){
      return exits.notFound();
    }

    return exits.success(
      {vendor}
    );

  }


};
