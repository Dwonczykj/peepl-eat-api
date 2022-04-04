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

    var vendorFulfilmentPostalDistricts = await Vendor.findOne(vendorid)
    .populate('fulfilmentPostalDistricts');

    // Get all postal districts
    var postalDistricts = await PostalDistrict.find();

    // set checked to true on postalDistricts that are also in vendorFulfilmentPostalDistricts
    postalDistricts.forEach((postalDistrict) => {
      var found = false;
      vendorFulfilmentPostalDistricts.fulfilmentPostalDistricts.forEach((vendorPostalDistrict) => {
        if(vendorPostalDistrict.id === postalDistrict.id){
          found = true;
        }
      });
      if(found){
        postalDistrict.checked = true;
      }
    });

    delFul = delFul.deliveryFulfilmentMethod;

    colFul = colFul.collectionFulfilmentMethod;

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
