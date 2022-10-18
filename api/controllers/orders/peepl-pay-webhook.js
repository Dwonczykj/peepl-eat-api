module.exports = {


  friendlyName: 'Peepl pay webhook',


  description: '',


  inputs: {
    publicId: {
      type: 'string',
      description: 'the paymentIntentId as this is the publicId that the peeplPay api keeps'
    },
    status: {
      type: 'string'
    }
  },


  exits: {
    orderNotFound: {
      statusCode: 404,
      responseType: 'notFound',
    },
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {

    var unixtime = Date.now();

    // Update order with payment ID and time
    var order = await Order.updateOne({
      paymentIntentId: inputs.publicId,
      completedFlag: "",
    })
      .set({
        paymentStatus: inputs.status === "paid" ? "paid" : "failed",
        paidDateTime: unixtime,
      });
    
    if(!order){
      return exits.orderNotFound();
    }
    
    order = await Order.findOne(order.id)
      .populate('vendor');

    try {
	    if(order.paymentStatus === 'paid'){
	      await sails.helpers.sendSmsNotification.with({
	        to: order.vendor.phoneNumber,
	        // body: `You have received a new order from vegi for delivery between ${order.fulfilmentSlotFrom} and ${order.fulfilmentSlotTo}. ` +
          // `To accept or decline: ' + sails.config.custom.baseUrl + '/admin/approve-order/' + order.publicId,
	        body: `[from vegi]
New order alert! 🚨
Order details ${sails.config.custom.baseUrl}/admin/approve-order/${order.publicId}
Please accept/decline ASAP.
Delivery/Collection on ${order.fulfilmentSlotFrom} - ${order.fulfilmentSlotTo}`,
          data: {
            orderId: order.id,
          },
	      });
	    } else {
	      await sails.helpers.sendSmsNotification.with({
	        to: order.deliveryPhoneNumber,
	        body:
	          "Your payment for a recent order failed. Details of order " +
	          order.fulfilmentSlotFrom +
	          " and " +
	          order.fulfilmentSlotTo +
	          ". Please review your payment method in the vegi app.",
          data: {
            orderId: order.id
          },
	      });
	    }
    } catch (error) {
      sails.log.error(`peepl-pay-webhook errored sending sms notification to vendor for paid order: ${error}`);
    }

    await sails.helpers.sendSlackNotification.with({order: order});
    // // Send order confirmation email
    // await sails.helpers.sendTemplateEmail.with({
    //   template: 'email-order-confirmation-new',
    //   templateData: {order: orderDetails},
    //   to: orderDetails.deliveryEmail,
    //   subject: 'Peepl Eat Order Confirmed - #' + orderDetails.id ,
    //   layout: false,
    // });

    // All done.
    return exits.success();

  }


};
