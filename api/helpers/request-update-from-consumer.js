const util = require('util');
module.exports = {
  friendlyName: 'Request update from consumer',

  description:
    'Send a firebase notification to request an update from a user on their order',

  inputs: {
    customerWalletAddress: {
      type: 'string',
      description: 'The wallet address of the customer.',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/,
    },
    orderPublicId: {
      type: 'string',
      required: true,
      description: 'order publicId',
    },
  },

  exits: {
    orderNotFound: {
      data: false,
    },
    orderVendorNotFound: {
      data: false,
    },
    success: {
      description: 'All done.',
      data: true,
    },
  },

  fn: async function (inputs, exits) {
    // * allow completed orders to use this function
    var order = await Order.findOne({
      customerWalletAddress: inputs.customerWalletAddress,
      publicId: inputs.orderPublicId,
    }).populate('vendor');

    if (!order) {
      return exits.orderNotFound();
    } else if (!order.vendor) {
      sails.log.error(`Vendor not found on order: ${util.inspect(order, {depth: null})}`);
      return exits.orderVendorNotFound(`Vendor not found on order: ${util.inspect(order, {depth: null})}`);
    }

    var vendorName = ' by vendor';
    try {
      vendorName = ' by ' + order.vendor.name;
    } catch {
      sails.log.warn('Order vendor does not exist');
    }

    // Intention is for users to then
    await sails.helpers.broadcastFirebaseNotificationForTopic.with({
      topic: 'order-' + inputs.orderPublicId,
      title: 'Order update - (Response required)',
      body:
        'Some items could not be fulfilled' +
        vendorName +
        '. Please update your order in the app.',
      //TODO: Add an x-path that opens the flutter app with the view shown ready to hit the action: /admin/
    });

    return exits.success();
  },
};
