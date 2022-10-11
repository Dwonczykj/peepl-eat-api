const OrderItem = require("../../models/OrderItem");

// const peeplPay = require('../../interfaces/peeplPay');

const OrderTypeEnum = {
  vegiEats: 'vegiEats',
  vegiPays: 'vegiPays',
};

class MockPeeplPayPricingAPI {
  async getAmountInCurrency({
    amount=0,
    fromCurrency= "",
    toCurrency= "",
  }){
    if (fromCurrency === "GBP") {
      if (toCurrency === "PPL") {
        return amount * (sails.config.custom.PPLTokenValueInPence / 100.0);
      } else if (toCurrency === 'GBPx'){
        return amount * 100.0;
      }
    } else if (fromCurrency === "PPL") {
      if (toCurrency === "GBP") {
        return amount / (sails.config.custom.PPLTokenValueInPence / 100.0);
      }
    } else if (fromCurrency === "GBPX") {
      if(toCurrency === "GBP"){
        return amount * 100;
      }
    }
    throw new Error(`MockPeeplPayPricingAPI cant convert from ${fromCurrency} to ${toCurrency}`);
  }
}

const peeplPay = new MockPeeplPayPricingAPI();

Object.freeze(OrderTypeEnum);

module.exports = {


  friendlyName: 'Customer update paid order',


  description: 'A handle for customers to repond to requests to update their order when a vendor was unable to service an entire order.',


  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true
    },
    customerWalletAddress: {
      type: 'string',
      required: true
    },
    retainItems: {
      type: 'ref',
      required: true,
      description: 'array of internal ids for the items'
    },
    removeItems: {
      type: 'ref',
      required: true,
      description: 'array of internal ids for the items'
    },
    refundRequestGBPx: {
      type: 'ref',
      required: true,
      description: 'specification of how refund recipient would like their refund to be made from GBPx (GBP*100)'
    },
    refundRequestPPL: {
      type: 'ref',
      required: true,
      description: 'specification of how refund recipient would like their refund to be made from PPL'
    },
  },


  exits: {
    badRequest: {
      statusCode: 401,
      description: 'likely caused by no items retained in the request',
      responseType: 'badRequest'
    },
    orderNotAuthorised: {
      description: 'thrown when the updated order has a larger total than the new order.',
      statusCode: 401,
      responseType: 'badRequest'
    },
    noPaidOrderFound: {
      statusCode: 404,
      responseType: 'notFound'
    },
    success: {
      statusCode: 200,
    }
  },


  fn: async function (inputs, exits) {

    if (!inputs.removeItems || !inputs.retailItems) {
      return exits.badRequest();
    }

    var order = await Order.findOne({
      publicId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
      paymentStatus: 'paid',
      completedFlag: '',
    });

    if (!order) {
      return exits.noPaidOrderFound();
    }

    //TODO: this function to create a new order object with a reference to the id of the original order,
    //TODO cont. flag the original as completedFlag: void and
    var response = await sails.helpers.updateItemsForOrder.with({
      orderId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
      retainItems: inputs.retainItems,
      removeItems: inputs.removeItems
    });

    if (!response || !response['validRequest']) {
      sails.log.warn('Bad partial fulfilment requested by consumer app on customer-update-order action');
      return exits.badRequest();
    }

    var newOrder = await Order.findOne({
      publicId: inputs.orderId,
      customerWalletAddress: inputs.customerWalletAddress,
      paymentStatus: 'paid',
      completedFlag: '',
    });

    var oldOrder = await Order.findOne({
      publicId: inputs.orderId,
      paymentStatus: 'paid',
      customerWalletAddress: inputs.customerWalletAddress,
      completedFlag: 'void',
      parentOrder: order.id,
    });

    if (oldOrder.total < newOrder.total) {
      return exits.orderNotAuthorised();
    }

    //TODO: Mock the below endpoints using the hardcoded token values in custom.js
    var gbpxPortion = await peeplPay.getAmountInCurrency.with({
      amount: inputs.refundRequestGBPx,
      fromCurrency: 'GBPx',
      toCurrency: 'GBP'
    });
    var pplPortion = await peeplPay.getAmountInCurrency.with({
      amount: inputs.refundRequestPPL,
      fromCurrency: 'PPL',
      toCurrency: 'GBP'
    });
    if ((oldOrder.total - newOrder.total) - (gbpxPortion + pplPortion) > 0.01) {
      // requested refund is more than 1p out of change in order value.
      return exits.badRequest();
    }

    var say;
    if (newOrder.fulfilmentMethod.methodType === 'delivery') {
      say = `Your vegi order for delivery between ${order.fulfilmentSlotFrom} and ${order.fulfilmentSlotTo} has bene updated. To view: ${sails.config.custom.baseUrl}/admin/order/${order.publicId}`;
    } else {
      say = `Your vegi order for collection between ${order.fulfilmentSlotFrom} and ${order.fulfilmentSlotTo} has bene updated. To view: ${sails.config.custom.baseUrl}/admin/order/${order.publicId}`;
    }
    await sails.helpers.sendSmsNotification.with({
      to: newOrder.vendor.phoneNumber,
      body: say
    });

    return exits.success({ orderID: newOrder.id });

    // revert the token issuance
    //TODO: Remove this as this is done by walletAPI of consumer app - get the acmount calc form in here and check it vs the inputs.
    // await sails.helpers.revertPeeplRewardIssue.with({
    //   peeplPayPaymentIntentId: newOrder.paymentIntentId,
    //   recipient: newOrder.customerWalletAddress,
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
    // return exits.success({ orderID: newOrder.id, paymentIntentID: newPaymentIntent.paymentIntentId });
    //TODO: Store the above info against the refund in the db, could have a new refunds object, then add the below to the webhook once receival of reverted rewards tokens has been confirmed / completed by peeplPay


  }

};
