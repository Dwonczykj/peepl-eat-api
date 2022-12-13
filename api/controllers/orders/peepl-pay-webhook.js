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

    if (
      process.env.NODE_ENV &&
      !process.env.NODE_ENV.toLowerCase().startsWith('prod')
    ) {
      sails.log(
        `peepl-pay-webhook updating order w/ payIntId: [${inputs.paymentIntentId}] to ${inputs.status}!`
      );
    }

    var unixtime = Date.now();

    if(!['paid', 'unpaid', 'failed'].includes(inputs.status)){
      sails.log.warn(`peepl-pay-webhook received inputs.status="${inputs.status}". This is not handled!`);
    }
    if (sails.config.custom.baseUrl !== 'https://vegi.itsaboutpeepl.com') {
      const util = require('util');
      sails.log(`peepl-pay-webook called with inputs: ${util.inspect(inputs, {depth: null})}`);
    }

    // Update order with payment ID and time
    var order = await Order.updateOne({
      paymentIntentId: inputs.publicId,
      completedFlag: '',
    }).set({
      paymentStatus: ['paid', 'unpaid', 'failed'].includes(inputs.status)
        ? inputs.status
        : 'failed',
      paidDateTime: unixtime,
    });

    if(!order){
      return exits.orderNotFound();
    }

    order = await Order.findOne(order.id)
      .populate('vendor');

    await sails.helpers.sendSlackNotification.with({ order: order });

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
	      await sails.helpers.sendSmsNotification.with({
          to: order.deliveryPhoneNumber,
          body: `Order accepted! Details of your order can be found in the My Orders section of the vegi app. Thank you!`,
          data: {
            orderId: order.id,
          },
        });
	    } else {
	      await sails.helpers.sendSmsNotification.with({
	        to: order.deliveryPhoneNumber,
	        body:
	          'Your payment for a recent order failed. Details of order ' +
	          order.fulfilmentSlotFrom +
	          ' and ' +
	          order.fulfilmentSlotTo +
	          '. Please review your payment method in the vegi app.',
          data: {
            orderId: order.id
          },
	      });
	    }
    } catch (error) {
      sails.log.error(`peepl-pay-webhook errored sending sms notification to vendor for paid order: ${error}`);
    }
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
