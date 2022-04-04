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

  },


  fn: async function (inputs) {
    var postalDistrict = await PostalDistrict.create({
      outcode: inputs.outcode
    }).fetch();

    // All done.
    return postalDistrict;

  }


};
