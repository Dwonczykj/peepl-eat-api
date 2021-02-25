module.exports = {


  friendlyName: 'Edit vendor',


  description: '',


  inputs: {
    vendor: {
      type: 'ref',
      description: 'The vendor object containing basic details like name, description, etc.',
      required: true
    },
    products: {
      type: 'ref',
      description: 'Details of the vendor\'s products.'
    }
  },


  exits: {

  },


  fn: async function () {

    // All done.
    return;

  }


};
