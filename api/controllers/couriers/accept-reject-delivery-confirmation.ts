module.exports = {


  friendlyName: 'Accept / Reject Delivery Confirmation',


  description: '',


  inputs: {
    deliveryId: {
      type: 'string',
      description: 'The delivery id generated by the courier',
      required: true
    },
    courierConfirmed: {
      type: 'boolean',
      required: true
    },
  },


  exits: {
    notFound: {
      statusCode: 404,
      description: 'No order found for courier delivery id'
    },
    courierAlreadyConfirmedOrder: {
      statusCode: 401,
      description: 'Courier has already confirmed this order.',
    },
    otherCourierRegisteredToOrder: {
      statusCode: 401,
      description: 'Order is registered to another courier!',
    },
  },


  fn: async function (inputs) {

    var order = await Order.findOne({
      deliveryId: inputs.deliveryId,
      completedFlag: ''
    });

    if (!order){
      throw 'notFound';
    }

    if (order.courierId !== null && order.courierId !== undefined && order.courierId !== this.req._user.uid){
      throw 'otherCourierRegisteredToOrder';
    }
    else if(order.courierId === this.req._user.uid && order.courierConfirmed) {
      // This Courier has previously confirmed the delivery, they cannot cancel the delivery after this.
      throw 'courierAlreadyConfirmedOrder';
    }

    await Order.updateOne({deliveryId: inputs.deliveryId})
        .set({
          courierAccepted: inputs.courierConfirmed,
          courierId: (inputs.courierConfirmed ? inputs.courierId : null),
          courierConfirmed: inputs.courierConfirmed,
        });

    //! No need to send notification to customer about courier accepted/declined as waiting for vendor.
    //TODO: Replace SMS after vendor accepts with an SMS after the courier then confirms its delivery.
    // await sails.helpers.sendFirebaseNotification.with({
    //   topic: 'order-' + order.publicId,
    //   title: 'Order update',
    //   body: 'Your order has been ' + (inputs.courierAccepted ? 'accepted 😎' : 'declined 😔') + '.'
    // });

    // All done.
    return;

  }


};
