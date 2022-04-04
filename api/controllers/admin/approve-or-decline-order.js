module.exports = {


  friendlyName: 'Approve or decline order',


  description: '',


  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    restaurantAccepted: {
      type: 'boolean',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs) {
    // TODO: Check if delivery slot is in future

    var order = await Order.findOne({publicId: inputs.orderId});

    if(order.restaurantAccepted) {
      // Restaurant has previously accepted, they cannot cancel the order after this.
      throw new Error('Restaurant has already accepted this order.');
    }

    await Order.updateOne({publicId: inputs.orderId})
    .set({restaurantAccepted: inputs.restaurantAccepted});

    // Send notification to customer that their order has been accepted/declined.
    await sails.helpers.sendFirebaseNotification.with({
      topic: 'order-' + order.id,
      title: 'Order update',
      body: 'Your order has been ' + (inputs.restaurantAccepted ? 'accepted 😎' : 'declined 😔') + '.'
    });

    // All done.
    return;

  }


};
