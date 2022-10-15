// const util = require("util");
module.exports = {
  friendlyName: "Peepl pay Update Paid Order webhook", //peeplWebhookAddressCustomerUpdatePaidOrder

  description: "",

  inputs: {
    publicId: {
      type: "string",
      description:
        "the paymentIntentId as this is the publicId that the peeplPay api keeps",
    },
    metadata: {
      type: "ref",
    },
    status: {
      type: "string",
    },
  },

  exits: {
    orderNotFound: {
      statusCode: 404,
    },
    orderMetadataDoesntMatch: {
      statusCode: 400,
    },
    success: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    var refundSucceeded = inputs.status === "success";

    var unixtime = Date.now();
    // var paidOrder = await Order.findOne({
    //   publicId: inputs.metadata.orderId,
    //   paymentIntentId: inputs.metadata.paymentIntentId,
    //   customerWalletAddress: inputs.metadata.customerWalletAddress,
    // });
    var paidOrder = await Order.findOne({
      paymentIntentId: inputs.publicId,
      parentOrder: null,
    });

    if (!paidOrder) {
      return exits.orderNotFound();
    }

    if (
      inputs.metadata &&
      Object.keys(inputs.metadata).includes("orderId") &&
      Object.keys(inputs.metadata).includes("paymentIntentId") &&
      Object.keys(inputs.metadata).includes("customerWalletAddress") &&
      (inputs.metadata.orderId !== paidOrder.publicId ||
        inputs.metadata.paymentIntentId !== paidOrder.paymentIntentId ||
        inputs.metadata.customerWalletAddress !==
          paidOrder.customerWalletAddress)
    ) {
      // sails.log.warn(
      //   `orderMetadataDoesntMatch -> ${util.inspect(inputs.metadata, {
      //     depth: null,
      //   })} != ${[
      //     paidOrder.publicId,
      //     paidOrder.paymentIntentId,
      //     paidOrder.customerWalletAddress,
      //   ]}`
      // );
      return exits.orderMetadataDoesntMatch();
    }

    const formulateMoney = (amount) => "£" + (amount / 100.0).toFixed(2);

    const refundGBPx = await Refund.findOne({
      paymentIntentId: inputs.publicId,
      currency: sails.config.custom.vegiDigitalStableCurrencyTicker,
    });
    const refundPPL = await Refund.findOne({
      paymentIntentId: inputs.publicId,
      currency: sails.config.custom.vegiGreenPointsTicker,
    });
    if (refundGBPx) {
      await Refund.updateOne(refundGBPx.id).set({
        refundStatus: refundSucceeded ? "paid" : "failed",
      });
    }
    if (refundPPL) {
      await Refund.updateOne(refundPPL.id).set({
        refundStatus: refundSucceeded ? "paid" : "failed",
      });
    }

    // Update order with payment ID and time
    if (refundSucceeded) {
      const order = await Order.updateOne(paidOrder.id).set({
        completedFlag: "partially refunded",
        refundDateTime: unixtime,
      });
      if (!order) {
        return exits.orderNotFound();
      }
    }

    var refundStr = refundSucceeded ? "success" : "failure";
    var refundWorked = refundSucceeded
      ? "has been partially refunded"
      : "failed to be partially refunded";
    const msgBody = `vegi order [${
      paidOrder.publicId
    }] ${refundWorked} with: ${formulateMoney(refundGBPx.amount)} and ${
      refundPPL.amount
    } vegi rewards points transferred back to`;
    const msgBodyCustomer = `Your ${msgBody} your wallet 😎.`;
    const msgBodyVendor = `Your customer's ${msgBody} their wallet 😎.`;
    const msgBodySupport = `Your customer's ${msgBody} the customer's wallet: '${paidOrder.customerWalletAddress}'.`;
    let customerNotified = false;
    let customerNotifiedFirebase = false;
    let vendorNotified = false;
    try {
      // TODO: Add test to check that this notification was created in the db.
      await sails.helpers.sendFirebaseNotification.with({
        topic: "order-" + paidOrder.publicId,
        title: "Order Partially Refunded",
        body: msgBodyCustomer,
        data: {
          orderId: paidOrder.id,
        },
      });
      customerNotifiedFirebase = true;
      await sails.helpers.sendSmsNotification.with({
        to: paidOrder.deliveryPhoneNumber,
        body: msgBodyCustomer,
        data: {
          orderId: paidOrder.id,
        },
      });
      customerNotified = true;
      await sails.helpers.sendSmsNotification.with({
        to: paidOrder.vendor.phoneNumber,
        body: msgBodyVendor,
        data: {
          orderId: paidOrder.id,
        },
      });
      vendorNotified = true;
      await sails.helpers.raiseVegiSupportIssue.with({
        orderId: paidOrder.publicId,
        title: "order_refund_" + refundStr,
        message: msgBodySupport,
      });
    } catch (error) {
      if (!customerNotifiedFirebase) {
        sails.log.error(
          `orders/peepl-pay-update-paid-order-webhook failed to send sms to new customer: ${error}`
        );
      } else if (!customerNotified) {
        sails.log.error(
          `orders/peepl-pay-update-paid-order-webhook failed to send sms to customer: ${error}`
        );
      } else if (!vendorNotified) {
        sails.log.error(
          `orders/peepl-pay-update-paid-order-webhook failed to send sms to vendor: ${error}`
        );
      } else {
        sails.log.error(`failed to contact vegi support with error: ${error}`);
      }
    }

    // All done.
    return exits.success({
      orderId: paidOrder.publicId,
      paymentIntentID: paidOrder.paymentIntentId,
      calculatedOrderTotal: paidOrder.total,
    });
  },
};
