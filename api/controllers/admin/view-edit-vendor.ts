declare var Vendor: any;
declare var PostalDistrict: any;
module.exports = {


  friendlyName: 'View edit vendor',


  description: 'Display "Edit vendor" page.',

  inputs: {
    vendorid: {
      type: 'number'
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-vendor'
    },
    successJSON: {
      statusCode: 200,
    }

  },


  fn: async function ({vendorid}, exits) {
    //Get current opening hours
    var vendor = await Vendor.findOne(vendorid)
    .populate('products&products.option&option.values');

    var delFul = await Vendor.findOne(vendorid)
    .populate('deliveryFulfilmentMethod&deliveryFulfilmentMethod.openingHours');

    var colFul = await Vendor.findOne(vendorid)
    .populate('collectionFulfilmentMethod&collectionFulfilmentMethod.openingHours');

    delFul = delFul.deliveryFulfilmentMethod;

    colFul = colFul.collectionFulfilmentMethod;

    // get postal districts from the database
    var postalDistricts = await PostalDistrict.find();

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {vendor, delFul, colFul, postalDistricts}
      );
    } else {
      return exits.success({vendor, delFul, colFul, postalDistricts});
    }

  }


};
