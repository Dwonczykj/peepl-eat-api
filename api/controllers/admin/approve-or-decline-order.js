const moment = require('moment');

const OrderTypeEnum = {
  //type: OrderTypeEnumLiteral
  vegiEats: 'vegiEats',
  vegiPays: 'vegiPays',
};

Object.freeze(OrderTypeEnum);


module.exports = {
  friendlyName: 'Approve or decline order',

  description: '',

  inputs: {
    orderId: {
      type: 'string',
      description: 'Public ID for the order.',
      required: true,
    },
    orderFulfilled: {
      type: 'string',
      isIn: ['accept', 'reject', 'partial'],
      required: true,
    },
    retainItems: {
      type: 'ref',
      required: true,
      description: 'array of publicIds for the items',
    },
    removeItems: {
      type: 'ref',
      required: true,
      description: 'array of publicIds for the items',
    },
  },

  exits: {
    badPartialFulfilmentRequestItems: {
      statusCode: 400,
      description:
        'Request failed to include retainItems or removeItems arrays',
      data: null,
    },
    orderNotFound: {
      statusCode: 404,
      description: 'Order not found',
    },
    orderNotPaidFor: {
      statusCode: 400,
      description: 'the order has not been paid for.',
    },
    orderNotPending: {
      statusCode: 400,
      description: 'Restaurant has already accepted or rejected this order.',
    },

    success: {
      statusCode: 200,
      data: null,
    },

    orderHasFulfilmentSlotInPast: {
      statusCode: 400,
      data: null,
    },
    partialFulfilFailed: {
      statusCode: 500,
      data: null,
    },
    orderHasNoItems: {
      statusCode: 400,
    },
  },

  fn: async function (inputs, exits) {
    var order = await Order.findOne({
      publicId: inputs.orderId,
      // fulfilmentSlotFrom: {
      //   '>=': new Date()
      // },
      completedFlag: 'none',
    });
    const slotTo = moment.utc(order.fulfilmentSlotTo, 'YYYY-MM-DD HH:mm:ss');
    if (slotTo.isBefore(moment.utc())) {
      const nowFormatted = moment.utc().format('YYYY-MM-DD HH:mm:ss');
      return exits.orderHasFulfilmentSlotInPast({
        data: `[${nowFormatted}] -> Order delivery slot already passed at ${order.fulfilmentSlotTo}.`,
      });
    }

    if (!order) {
      sails.log('approve or decline order - order NOT found');
      return exits.orderNotFound();
    }

    if (order.restaurantAcceptanceStatus !== 'pending') {
      // Restaurant has previously accepted or declined the order, they cannot modify the order acceptance after this.
      return exits.orderNotPending();
    }

    if (order.paymentStatus !== 'paid') {
      // Order is not paid
      return exits.orderNotPaidFor();
    }

    if (inputs.orderFulfilled === 'accept') {
      if (order.subtotal <= 0) {
        return exits.orderHasNoItems();
      }

      await Order.updateOne(order.id).set({
        restaurantAcceptanceStatus: 'accepted',
      });

      // Issue Peepl rewards
      let rewardsIssued = false;
      try {
        var rewardAmountResult = await sails.helpers.calculatePplReward.with({
          amount: order.subtotal,
          orderType: OrderTypeEnum.vegiEats,
        });

        const rewardAmount = rewardAmountResult.data;

        await sails.helpers.issuePeeplReward.with({
          rewardAmount: rewardAmount,
          recipient: order.customerWalletAddress,
        });

        rewardsIssued = true;

        await Order.updateOne(order.id).set({ rewardsIssued: rewardAmount });
      } catch (error) {
        sails.log.error(`Unable to issue PPL Rewards: ${error}`);
      }

      if (!rewardsIssued) {
        try {
          await sails.helpers.raiseVegiSupportIssue.with({
            orderId: order.publicId,
            title: 'order_reward_issue_failed_',
            message: `Order Rewards Points Issue Failed: ${order.publicId} -> Failed to send PPL to wallet '${order.customerWalletAddress}'.`,
          });
        } catch (error) {
          sails.log.error(
            `failed to raise vegi support issue to log a failed rewards points issue for an accepted order: ${error}`
          );
        }
      }
      // Send notification to customer that their order has been accepted/declined.
      await sails.helpers.broadcastFirebaseNotificationForTopic.with({
        topic: 'order-' + order.publicId,
        title: 'Order update',
        body: 'Your order has been accepted 😎.',
      });
      await sails.helpers.sendSmsNotification.with({
        to: order.deliveryPhoneNumber,
        body: `Order confirmed with vendor! Details of your order can be found in the My Orders section of the vegi app. Thank you!`,
        data: {
          orderId: order.id,
        },
      });
    } else if (inputs.orderFulfilled === 'reject') {
      await Order.updateOne(order.id).set({
        restaurantAcceptanceStatus: 'rejected',
      });
      if (order.paymentStatus === 'paid') {
        try {
          // send a refund to the user:
          //todo vegi has no idea how much of payment was funded by PPL and GBPx split?
          //! for now refund all in GBPx for order cancellation so that do not need to ask custoemr.
          await sails.helpers.revertPaymentFull.with({
            paymentId: order.paymentIntentId,
            refundAmount: order.total,
            refundRecipientWalletAddress: order.customerWalletAddress,
            recipientName: order.deliveryName,
            refundFromName: order.vendor.name,
          });
          // ! Do NOT revert the token issuance as not issued yet, only issued above in acceptance flow
        } catch (error) {
          sails.log.error(
            `Unable to Revert the Order Payment in full for rejected order with error: ${error}`
          );
        }
      }

      await sails.helpers.broadcastFirebaseNotificationForTopic.with({
        topic: 'order-' + order.publicId,
        title: 'Order update',
        body: 'Your order has been declined 😔.',
      });
    } else if (inputs.orderFulfilled === 'partial') {
      try {
        var response = await sails.helpers.updateItemsForOrder.with({
          orderId: inputs.orderId,
          customerWalletAddress: order.customerWalletAddress,
          retainItems: inputs.retainItems,
          removeItems: inputs.removeItems,
        });

        if (!response || !response.data['validRequest']) {
          sails.log.warn(
            'Bad partial fulfilment requested by vendor on approve-or-decline-order action with missing items.'
          );
          return exits.badPartialFulfilmentRequestItems();
        }
      } catch (error) {
        sails.log.error(
          `helpers.updateItemsForOrder -> Unable to clone a child order to create a vendor partially fulfilled order: ${error}`
        );
        return exits.partialFulfilFailed();
      }

      try {
        await sails.helpers.requestUpdateFromConsumer.with({
          customerWalletAddress: order.customerWalletAddress,
          orderPublicId: order.publicId,
        });
      } catch (error) {
        sails.log.error(
          `helpers.requestUpdateFromConsumer for partial fulfilment -> failed: ${error}`
        );
        return exits.partialFulfilFailed();
      }

      // * wait for user response via /admin/customer-update-order controller action.
    } else {
      sails.log.warn(
        `Unknown orderFulfilled status of '${inputs.orderFulfilled}' passed to approve-or-decline-order action.`
      );
    }
    // All done.
    return exits.success();
  },
};
