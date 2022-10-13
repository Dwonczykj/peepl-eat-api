module.exports = {
  friendlyName: "Peepl pay refunds webhook",

  description: "",

  inputs: {
    publicId: {
      type: "string",
      description:
        "the paymentIntentId as this is the publicId that the peeplPay api keeps",
    },
    status: {
      type: "string",
      // isIn: ["success", "failure"],
    },
  },

  exits: {
    orderNotFound: {
      statusCode: 404,
      responseType: "notFound",
    },
    success: {
      statusCode: 200,
      data: null,
    },
  },

  fn: async function (inputs, exits) {
    var refundSucceeded = inputs.status === "success";
    
    var unixtime = Date.now();

    // Update order with payment ID and time
    if (refundSucceeded) {
      const order = await Order.updateOne({ paymentIntentId: inputs.publicId }).set({
        completedFlag: "refunded",
        refundDateTime: unixtime,
      });
      if (!order) {
        return exits.orderNotFound();
      }
    }

    var order = await Order.findOne({
      paymentIntentId: inputs.publicId,
    }).populate("vendor");
    
    if (!order) {
      return exits.orderNotFound();
    }

    var formulateMoney = function (amount) {
      "£" + (amount / 100.0).toFixed(2);
    };

    var refundStr = refundSucceeded ? "success" : "failure";
    var refundWorked = refundSucceeded
      ? "has been successfully refunded"
      : "failed to be refunded";
    try {
	    await sails.helpers.sendSmsNotification.with({
	      to: order.deliveryPhoneNumber,
	      body:
	        "Your vegi order: " +
	        order.publicId +
	        ` ${refundWorked} for ` +
	        formulateMoney(order.total),
	    });
	    await sails.helpers.sendSmsNotification.with({
	      to: order.vendor.phoneNumber,
	      body:
	        "Refund complete for vegi order: " +
	        order.publicId +
	        ". Order " +
	        refundWorked +
	        " to customer for " +
	        formulateMoney(order.total),
	    });
	    
	    await sails.helpers.raiseVegiSupportIssue.with({
	      orderId: order.publicId,
	      title: "order_refund_" + refundStr,
	      message:
	        `Order Refund ${refundStr}: ${order.publicId} ${refundWorked} to wallet '${order.customerWalletAddress}' for ` +
	        formulateMoney(order.total) +
	        ".",
	    });
    } catch (error) {
      sails.log.error(`failed to contact vegi support with error: ${error}`);
    }

    return exits.success();
  },
};
