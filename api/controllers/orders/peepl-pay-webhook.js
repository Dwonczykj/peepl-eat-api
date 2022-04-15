module.exports = {


  friendlyName: 'Peepl pay webhook',


  description: '',


  inputs: {
    publicId: {
      type: 'string'
    },
    status: {
      type: 'string'
    }
  },


  exits: {
  },


  fn: async function (inputs) {

    var unixtime = Date.now();

    // Update order with payment ID and time
    await Order.updateOne({paymentIntentId: inputs.publicId})
    .set({
      paymentStatus: 'paid',
      paidDateTime: unixtime
    });

    var order = await Order.findOne({paymentIntentId: inputs.publicId})
    .populate('vendor');

    await sails.helpers.sendSmsNotification.with({body: 'You have received a new order from Vegi for delivery between ' + order.fulfilmentSlotFrom + ' and ' + order.fulfilmentSlotTo + '. To accept or decline: ' + sails.config.custom.baseUrl + '/admin/approve-order/' + order.publicId, to: order.vendor.phoneNumber});

    // // Send order confirmation email
    // await sails.helpers.sendTemplateEmail.with({
    //   template: 'email-order-confirmation-new',
    //   templateData: {order: orderDetails},
    //   to: orderDetails.deliveryEmail,
    //   subject: 'Peepl Eat Order Confirmed - #' + orderDetails.id ,
    //   layout: false,
    // });

    // All done.
    return;

  }


};
