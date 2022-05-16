module.exports = {


  friendlyName: 'Get postal districts',


  description: '',


  inputs: {
    vendor: {
      type: 'number',
      description: 'The id of the vendor.',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var vendor = await Vendor.findOne(inputs.vendor)
      .populate('fulfilmentPostalDistricts');

    // All done.
    return vendor.fulfilmentPostalDistricts;

  }


};
