module.exports = {


  friendlyName: 'Get all postal districts',


  description: '',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs) {
    var postalDistricts = await PostalDistrict.find();

    // All done.
    return postalDistricts;

  }


};
