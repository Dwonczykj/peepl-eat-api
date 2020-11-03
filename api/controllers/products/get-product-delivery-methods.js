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

     for(var product in products) {
        for (var product2 in products) {
          var productsSharingDeliveryOptions = [];
          if ((products[product].id != products[product2].id) && (JSON.stringify(_.pluck(products[product].deliveryMethods, 'id')) == JSON.stringify(_.pluck(products[product2].deliveryMethods, 'id')))) {
            productsSharingDeliveryOptions.push(products[product2].id);
            // console.log(products[product2]);
          }
        }
      }

    _.map(products, function(object) {
      output[object.id] = object.deliveryMethods;
      // return _.pick(object, ['id', 'deliveryMethods']);
    });

    // All done.
    return output;

  }


};