declare var Product: any;
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

  fn: async function (inputs, exits) {
    var output = {};

    var products = await Product.find(inputs.productids)
    .meta({enableExperimentalDeepTargets:true})
    .populate('deliveryMethods.deliveryMethodSlots',
    [
      {},
      {
        slotsRemaining: { '>': 0 },
        startTime: { '>': Math.floor(Date.now() / 1000)}
      }
    ]);

    for(var product in products) {
      var deliveryMethodIds = JSON.stringify(_.pluck(products[product].deliveryMethods, 'id'));
      products[product].deliveryMethodIds = deliveryMethodIds;
      output[deliveryMethodIds] = {products: [], deliveryMethods: products[product].deliveryMethods};
    }

    for(var productNew in products) {
      output[products[productNew].deliveryMethodIds].products.push(products[productNew]);
    }

    // All done.
    return exits.success(output);

  }

};
