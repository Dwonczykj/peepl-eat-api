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
    }
  },


  fn: async function (inputs) {
    // Check whether user is authorised for vendor.
    let vendor = await Vendor.findOne({id: inputs.vendorId});
    if(!vendor){
      throw 'Vendor not found';
    }

    // Check if user is authorised to edit product option.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: inputs.vendorId
    });

    if(!isAuthorisedForVendor) {
      throw 'unauthorised';
    }

    var updatedVendor = await Vendor.replaceCollection(inputs.vendorId, 'fulfilmentPostalDistricts')
    .members(inputs.districts);

    return updatedVendor;
  }


};
