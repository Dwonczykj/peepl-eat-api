module.exports = {


  friendlyName: 'Create order',


  description: '',


  inputs: {
    products: {
      type: 'ref',
      description: 'An object containing keys which correspond to a product id, then a value that corresponds to a quantity of that product that the user would like to order.',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var productIds = _.keys(inputs.products);
    var products = await Product.find(productIds);

    console.log(productIds);

    // All done.
    return;

  }


};
