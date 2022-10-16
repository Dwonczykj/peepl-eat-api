const util = require("util");

// const peeplPay = require('../../interfaces/peeplPay');

const OrderTypeEnum = {
  vegiEats: "vegiEats",
  vegiPays: "vegiPays",
};

class MockPeeplPayPricingAPI {
  async getAmountInCurrency({
    amount = 0,
    fromCurrency = "",
    toCurrency = "",
  }) {
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();
    if (fromCurrency === "GBP") {
      if (toCurrency === "PPL") {
        return amount * (sails.config.custom.PPLTokenValueInPence / 100.0);
      } else if (toCurrency === "GBPX") {
        return amount * 100.0;
      }
    } else if (fromCurrency === "PPL") {
      if (toCurrency === "GBP") {
        return amount / (sails.config.custom.PPLTokenValueInPence / 100.0);
      } else if (toCurrency === "GBPX") {
        return amount / sails.config.custom.PPLTokenValueInPence;
      }
    } else if (fromCurrency === "GBPX") {
      if (toCurrency === "GBP") {
        return amount / 100;
      } else if (toCurrency === "PPL") {
        return amount * sails.config.custom.PPLTokenValueInPence;
      }
    }
    throw new Error(
      `MockPeeplPayPricingAPI cant convert from ${fromCurrency} to ${toCurrency}`
    );
  }
}

const peeplPay = new MockPeeplPayPricingAPI();

Object.freeze(OrderTypeEnum);

module.exports = {
  friendlyName: "Customer update paid order",

  description:
    "A handle for customers to repond to requests to update their order when a vendor was unable to service an entire order.",

  inputs: {
    orderId: {
      type: "string",
      description: "Public ID for the order.",
      required: true,
    },
    customerWalletAddress: {
      type: "string",
      required: true,
    },
    retainItems: {
      type: "ref",
      required: true,
      description: "array of internal ids for the items",
    },
    removeItems: {
      type: "ref",
      required: true,
      description: "array of internal ids for the items",
    },
    refundRequestGBPx: {
      type: "ref",
      required: true,
      description:
        "specification of how refund recipient would like their refund to be made from GBPx (GBP*100)",
    },
    refundRequestPPL: {
      type: "ref",
      required: true,
      description:
        "specification of how refund recipient would like their refund to be made from PPL",
    },
  },

  exits: {
    badRequest: {
      statusCode: 400,
      description: "likely caused by no items retained in the request",
    },
    orderNotAuthorised: {
      description:
        "thrown when the updated order has a larger total than the new order.",
      statusCode: 401,
    },
    orderNotFound: {
      statusCode: 404,
      description:
        "Order not found either because publicId does not exist or because the customerWalletAddress does not agree or because the order has already been flagged as completed.",
    },
    orderAlreadyCompleted: {
      statusCode: 401,
      description: "Order has already been flagged as completed.",
    },
    orderNotPaid: {
      statusCode: 401,
      description:
        "order has not yet been paid for so no refund needs to be processed",
    },
    noPaidOrderFound: {
      statusCode: 404,
    },
    error: {
      statusCode: 400,
      error: null,
    },
    incompleteOrderInformationStoredDB: {
      statusCode: 501,
      description: "the stored order doesnt have the paymentIntentId set",
    },
    success: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    if (!inputs.removeItems || !inputs.retainItems) {
      return exits.badRequest();
    }

    var order = await Order.findOne({
      publicId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
    });

    if (!order) {
      return exits.orderNotFound();
    }

    if (order.completedFlag !== "") {
      return exits.orderAlreadyCompleted();
    }

    if (order.paymentStatus !== "paid") {
      return exits.orderNotPaid();
    }

    if (!order.paymentIntentId || !order.customerWalletAddress) {
      return exits.incompleteOrderInformationStoredDB();
    }

    var response = await sails.helpers.updateItemsForOrder.with({
      orderId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
      retainItems: inputs.retainItems,
      removeItems: inputs.removeItems,
    });

    if (
      !response ||
      !response.data["validRequest"] ||
      !response.data["orderId"]
    ) {
      sails.log.warn(
        "Bad partial fulfilment requested by consumer app on customer-update-order action"
      );
      return exits.badRequest();
    }

    const newOrder = await Order.findOne({
      id: response.data.orderId,
      parentOrder: order.id,
      paymentIntentID: response.data.paymentIntentId,
      customerWalletAddress: inputs.customerWalletAddress,
    }).populate("vendor");

    if (!newOrder || !newOrder.vendor) {
      return exits.orderNotFound();
    }

    const oldOrder = await Order.findOne(order.id);
    if (!oldOrder) {
      return exits.orderNotFound();
    }
    if (oldOrder.completedFlag !== "void") {
      return exits.error(
        new Error(
          `helpers.updateItemsForOrder failed to update the original order's completed flag to void`
        )
      );
    }

    if (oldOrder.total < newOrder.total) {
      const oldOrderItems = await OrderItem.find({
        order: oldOrder.id,
      });
      const newOrderItems = await OrderItem.find({
        order: newOrder.id,
      });
      sails.log.warn(
        `New order after customer update has a total greater than than the original order total. Items can only be retained or removed by the customer. Check! ${util.inspect(
          {
            oldOrderTotal: oldOrder.total,
            newOrderTotal: newOrder.total,
            oldOrderItems,
            newOrderItems,
          },
          { depth: null }
        )}`
      );
      return exits.orderNotAuthorised();
    }
    let _gbpxPortion;
    let _pplPortion;
    try {
      sails.log.warn(
        `Using MockPeeplPayPricingAPI to get PPL and GBPx currency conversions in admin/customer-update-paid-order`
      );
      _gbpxPortion = await peeplPay.getAmountInCurrency({
        amount: inputs.refundRequestGBPx,
        fromCurrency: "GBPx",
        toCurrency: "GBP",
      });
      _pplPortion = await peeplPay.getAmountInCurrency({
        amount: inputs.refundRequestPPL,
        fromCurrency: "PPL",
        toCurrency: "GBP",
      });
      sails.log(`gbpx -> ${_gbpxPortion}; ppl -> ${_pplPortion}`);
      if (
        oldOrder.total - newOrder.total - (_gbpxPortion + _pplPortion) >
        0.01
      ) {
        // requested refund is more than 1p out of change in order value.
        return exits.badRequest();
      }
    } catch (error) {
      sails.log.error(
        `admin/customer-update-paid-order failed to check if partial refund amonut is within 1p of change to order value: ${error}`
      );
      return exits.error(
        new Error(
          `admin/customer-update-paid-order failed to check if partial refund amonut is within 1p of change to order value: ${error}`
        )
      );
    }

    const gbpxPortionToRefundToCustomer = _gbpxPortion;
    const pplPortionToRefundToCustomer = _pplPortion;

    try {
      // send a refund to the user:
      await sails.helpers.revertPaymentPartial.with({
        paymentId: oldOrder.paymentIntentId, //same as newOrder.paymentIntentId
        refundRequestGBPx: gbpxPortionToRefundToCustomer,
        refundRequestPPL: pplPortionToRefundToCustomer,
        refundRecipientWalletAddress: oldOrder.customerWalletAddress,
        recipientName: newOrder.deliveryName,
        refundFromName: newOrder.vendor.name,
      });
    } catch (error) {
      sails.log.error(
        `peepl-pay-update-paid-order-webhook failed to partially revert the payment (helpers.revertPaymentPartial): ${error}`
      );
    }

    // create a new request for the vendor to check that they can service the updated order.
    await sails.helpers.sendSmsNotification.with({
      to: newOrder.vendor.phoneNumber,
      body:
        `You have received an updated order from vegi resulting from the partial fulfillment of order: ${newOrder.parentOrder.publicId}. ` +
        `The updated order is scheduled for delivery between ${newOrder.fulfilmentSlotFrom} and ${newOrder.fulfilmentSlotTo}. ` +
        `Please accept or decline the update: ` +
        sails.config.custom.baseUrl +
        "/admin/approve-order/" +
        newOrder.publicId,
      data: {
        orderId: newOrder.id
      },
    });

    return exits.success({ orderId: newOrder.id });

    // revert the token issuance
    // this is done by walletAPI of consumer app - get the acmount calc form in here and check it vs the inputs.
    // await sails.helpers.revertPeeplRewardIssue.with({
    //   peeplPayPaymentIntentId: newOrder.paymentIntentId,
    //   recipient: newOrder.customerWalletAddress,
    //   rewardsIssued: ...
    //   paymentAmountBeingRefunded: oldOrder.total - newOrder.total //! this part calls sails.helpers.calculatePPLReward internally
    // });

    // ! Do NOT NEED TO REVERT The the PPL reward as it is only issued once the
    // ! order has been accepted by the vendor in approve-or-decline-order.js
    // const revertRewardPPLAmount = await sails.helpers.calculatePPLReward.with({
    //   amount: (oldOrder.total - newOrder.total),
    //   orderType: OrderTypeEnum.vegiEats
    // });

    // // Create PaymentIntent on Peepl Pay
    // var newPaymentIntent = await sails.helpers.createPaymentIntentForSendingPPLPoints(
    //   revertRewardPPLAmount,
    //   sails.config.custom.vegiCommunityManagerAddress, //pushes an update to user via firebase when order has comnpleted via peeplPay posting back to peeplEatWebHook
    //   'vegi'
    // )
    //   .catch(() => {
    //     return exits.error(new Error('Error creating payment intent'));
    //   });

    // if (!newPaymentIntent) {
    //   return exits.error(new Error('Error creating payment intent'));
    // }

    // // Update order with payment intent
    // await Refund.updateOne(newOrder.id)
    //   .set({ paymentIntentId: newPaymentIntent.paymentIntentId });

    // All done.
    // return exits.success({ orderId: newOrder.id, paymentIntentID: newPaymentIntent.paymentIntentId });
  },
};
