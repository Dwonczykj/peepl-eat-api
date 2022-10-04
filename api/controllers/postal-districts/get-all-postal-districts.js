module.exports = {


  friendlyName: 'Get all postal districts',


  description: '',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs, exits) {
    var postalDistricts = await PostalDistrict.find();

    // All done.
    return exits.success({ postalDistricts: postalDistricts });

  }


};
