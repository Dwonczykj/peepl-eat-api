module.exports = {


  friendlyName: 'Create postal district',


  description: '',


  inputs: {
    outcode: {
      type: 'string',
      required: true
    }
  },


  exits: {
    postalDistrictAlreadyExists: {
      statuscode: 401,
      description: 'Postal District already exists'
    },
    success: {
      data: null,
      statuscode: 200,
    }
  },


  fn: async function (inputs, exits) {
    var existingPostalDistrict = await PostalDistrict.find({
      outcode: inputs.outcode
    });

    if (existingPostalDistrict) {
      exits.postalDistrictAlreadyExists();
    }

    var postalDistrict = await PostalDistrict.findOrCreate({
      outcode: inputs.outcode
    }).fetch();

    // All done.
    return exits.success({ data: postalDistrict });

  }


};
