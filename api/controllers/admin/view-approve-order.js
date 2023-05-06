module.exports = {
  friendlyName: 'View approve order',

  description: 'Display "Approve order" page.',

  inputs: {
    orderId: {
      type: 'string',
      description: 'The public id of the order to be approved or rejected.',
      required: true,
    },
  },

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/approve-order',
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (inputs, exits) {
    var order = await Order.findOne({
      publicId: inputs.orderId,
      completedFlag: 'none',
    }).populate(
      'fulfilmentMethod&items.product&optionValues&optionValues.option&optionValue'
    );

    if (!order) {
      return exits.notFound();
    }

    // Respond with view.
    return exits.success({ order });
  },
};
