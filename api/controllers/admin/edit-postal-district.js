module.exports = {


  friendlyName: 'Edit postal district',


  description: '',


  inputs: {
    id: {
      type: 'number',
      required: true
    },
    outcode: {
      type: 'string',
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var updatedPostalDistrict = await PostalDistrict.updateOne(inputs.id).set(inputs);

    // All done.
    return updatedPostalDistrict;

  }


};
