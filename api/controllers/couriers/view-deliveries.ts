//! show 2 tables, the couriers delivery requests in progress and then all unfulfilled delivery requests


declare var Order: any;
module.exports = {

  friendlyName: 'View deliveries',

  description: 'Display "Courier Deliveries" page.',

  inputs: {
    courierId: {
      type: 'string',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/couriers/deliveries'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    var orders = await Order.find({
      or: [
        {courierId: inputs.courierId},
        {courierId: -1, fulfilmentMethod: 1},
      ],
      completedFlag: '',
    })
    .populate('deliveryId&vendor&fulfilmentSlotFrom&fulfilmentSlotTo&deliveryAddressLineOne&deliveryAddressLineTwo&deliveryAddressCity&deliveryAddressPostCode'); // https://sailsjs.com/documentation/concepts/models-and-orm/associations#?associations-in-retrieved-records

    const yourOrders = orders.filter((order) => order.courierId === inputs.courierId);
    const otherOrders = orders.filter((order) => order.courierId === -1);
    
    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {yourOrders, otherOrders}
      );
    } else {
      return exits.success({yourOrders, otherOrders});
    }


  }

};
