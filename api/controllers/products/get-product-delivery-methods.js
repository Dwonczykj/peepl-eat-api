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

    var products = await Product.find(inputs.productids)
    .meta({enableExperimentalDeepTargets:true})
    .populate('deliveryMethods.deliveryMethodSlots', [{},
      {
        where: {
          slotsRemaining: { '>': 0 },
          startTime: { '>': Math.floor(Date.now() / 1000)}
        }
      }]);

    console.log(products[0].deliveryMethods[1].deliveryMethodSlots);

    for(var product in products) {
      var deliveryMethodIds = JSON.stringify(_.pluck(products[product].deliveryMethods, 'id'));
      products[product].deliveryMethodIds = deliveryMethodIds;
      output[deliveryMethodIds] = {products: [], deliveryMethods: products[product].deliveryMethods};
    }

    for(var product in products) {
      output[products[product].deliveryMethodIds].products.push(products[product]);
    }

    // All done.
    return output;

  }


};