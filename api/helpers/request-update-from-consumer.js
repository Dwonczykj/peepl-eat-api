module.exports = {


  friendlyName: 'Request update from consumer',


  description: 'Send a firebase notification to request an update from a user on their order',


  inputs: {
    customerWalletAddress: {
      type: 'string',
      description: 'The wallet address of the customer.',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/
    },
    orderPublicId: {
      type: 'string',
      required: true,
      description: 'order publicId'
    }
  },


  exits: {

    orderNotFound: {
      data: false
    },

    success: {
      description: 'All done.',
      data: true,
    },

  },


  fn: async function (inputs, exits) {

    // * allow completed orders to use this function
    var order = Order.findOne({
      customerWalletAddress: inputs.customerWalletAddress,
      publicId: inputs.orderPublicId,
    });

    if (!order) {
      return exits.orderNotFound();
    }

    var vendorName = ' by vendor';
    try {
      vendorName = ' by ' + order.vendor.name;
    } catch {
      sails.log.warn('Order vendor does not exist');
    }

    // Intention is for users to then 
    return await sails.helpers.sendFirebaseNotification.with({
      topic: 'order-' + inputs.orderPublicId,
      title: 'Order update - (Response required)',
      body: 'Some items could not be fulfilled' + vendorName + '. Please update your order in the app.'
      //TODO: Add an x-path that opens the flutter app with the view shown ready to hit the action: /admin/
    });

  }

};
