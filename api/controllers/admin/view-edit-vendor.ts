declare var Vendor: any;
declare var PostalDistrict: any;
declare var DeliveryPartner: any;
declare var CategoryGroup: any;
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


  fn: async function (inputs, exits) {
    var vendorid;
    let user = await User.findOne({id: this.req.session.userId});

    if(user.isSuperAdmin && inputs.vendorid) {
      vendorid = inputs.vendorid;
    } else {
      vendorid = user.vendor;
    }

    var vendor = await Vendor.findOne(vendorid)
      .populate('productCategories&products&products.options&options.values');

    if(!vendor) {
      return exits.notFound();
    }

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

    // Get a list of delivery partners
    var deliveryPartners = await DeliveryPartner.find({status: 'active'});

    var categoryGroups = await CategoryGroup.find();

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        { vendor, delFul, colFul, postalDistricts, deliveryPartners, categoryGroups }
      );
    } else {
      return exits.success({ vendor, delFul, colFul, postalDistricts, deliveryPartners, categoryGroups });
    }

  }


};
