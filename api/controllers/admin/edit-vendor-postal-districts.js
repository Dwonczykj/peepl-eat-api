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

  },


  fn: async function (inputs) {
    var updatedVendor = await Vendor.updateOne({id: inputs.vendorId}).set({postalDistricts: inputs.districts});
    return updatedVendor;
  }


};
