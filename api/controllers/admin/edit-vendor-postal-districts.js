module.exports = {


  friendlyName: 'Edit vendor postal districts',


  description: '',


  inputs: {
    districts:{
      type: 'ref',
      description: 'The districts to be added to the vendor',
      required: true
    },
    vendorId:{
      type: 'number',
      description: 'The id of the vendor to be edited',
      required: true
    }
  },


  exits: {
    notFound:{
      responseType: 'notFound'
    },
    unauthorised:{
      responseType: 'unauthorised'
    },
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {
    // Check whether user is authorised for vendor.
    let vendor = await Vendor.findOne({id: inputs.vendorId});
    if(!vendor){
      return exits.notFound();
    }

    // Check if user is authorised to edit product option.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: inputs.vendorId
    });

    if(!isAuthorisedForVendor) {
      return exits.unauthorised();
    }

    await Vendor.replaceCollection(vendor.id, 'fulfilmentPostalDistricts')
    .members(inputs.districts);

    vendor = await Vendor.findOne(vendor.id).populate(
      "fulfilmentPostalDistricts"
    );

    return exits.success(vendor);
  }


};
