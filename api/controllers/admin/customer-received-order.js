const Order = require("../../models/Order");
const OrderItem = require("../../models/OrderItem");

module.exports = {


  friendlyName: 'Customer received order',


  description: 'A handle for customers to confirm completion of an order',


  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    orderReceived: {
      type: 'boolean',
      required: true,
    },
    orderCondition: {
      type: 'number',
      isIn: [0, 1, 2, 3, 4, 5],
      min: 0,
      max: 5,
      required: true,
    },
    deliveryPunctuality: {
      type: 'number',
      min: 0,
      max: 5,
      isIn: [0, 1, 2, 3, 4, 5],
    },
    feedback: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },


  exits: {
    notFound: {
      statusCode: 404,
      description: 'Order not found',
    },
    badRequest: {
      statusCode: 401,
      description: 'likely caused by no items retained in the request'
    },
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {
    var order = await Order.findOne({ publicId: inputs.orderId, completedFlag: '' });
    if (!order) {
      return exits.notFound();
    }

    if (inputs.orderReceived) {
      await Order
        .updateOne({
          publicId: inputs.orderId,
          completedFlag: ''
        })
        .set({
          completedFlag: 'completed',
          completedOrderFeedback: inputs.feedback.replace(/[\t\r\n]|(--[^\r\n]*)|(\/\*[\w\W]*?(?=\*)\*\/)/gi, ''),
          deliveryPunctuality: inputs.deliveryPunctuality,
          orderCondition: inputs.orderCondition,
        });
    } else {
      var feedback = '';
      if (inputs.feedback) {
        feedback = ` The user gave feedback: \n   ${inputs.feedback}.\n`;
      }
      await sails.helpers.raiseVegiSupportIssue.with({
        orderId: inputs.orderId,
        title: 'order_not_received',
        message: `Order not received.${feedback}`
      });
    }
    // All done.
    return exits.success();

  }

};
