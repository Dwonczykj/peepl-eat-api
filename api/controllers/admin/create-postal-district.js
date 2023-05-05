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
      statusCode: 401,
      description: 'Postal District already exists'
    },
    success: {
      data: null,
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {
    var existingPostalDistrict = await PostalDistrict.find({
      outcode: inputs.outcode
    });

    if (existingPostalDistrict && existingPostalDistrict.length > 0) {
      return exits.postalDistrictAlreadyExists();
    }

    var postalDistrict = await PostalDistrict.create({
      outcode: inputs.outcode
    }).fetch();

    // All done.
    return exits.success({postalDistrict});

  }


};
