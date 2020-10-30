module.exports = {


  friendlyName: 'Get product delivery methods',


  description: 'Get the delivery methods for an array of products.',


  inputs: {
    productids: {
      type: 'ref',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    var output = {};

    var products = await Product.find(inputs.productids).populate('deliveryMethods.deliveryMethodSlots');
    var deliveryMethods = _.map(products, function(object) {
      return _.pick(object, ['id', 'deliveryMethods']);
    });

    // All done.
    return deliveryMethods;

  }


};
