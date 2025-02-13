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
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {
    var vendor = await Vendor.findOne(inputs.vendor)
      .populate('fulfilmentPostalDistricts');

    // All done.
    return exits.success(vendor.fulfilmentPostalDistricts);

  }


};
