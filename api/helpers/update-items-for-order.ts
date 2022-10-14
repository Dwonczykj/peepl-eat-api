declare var Order: any;
declare var OrderItem: any;
declare var Cloud: any;
const util = require("util");

module.exports = {
  friendlyName: "Update items for order",

  description: "This helper function will update / remove items for an order",

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
  },

  exits: {
    badPartialFulfilmentRequestItems: {
      description:
        "Request failed to include retainItems or removeItems arrays",
      data: null,
    },
    orderNotFound: {
      description: "Order not found",
      data: null,
    },
    orderNotPaidFor: {
      description: "the order has not been paid for.",
      data: null,
    },
    orderNotPending: {
      description: "Restaurant has already accepted or rejected this order.",
      data: null,
    },
    orderAlreadyCompleted: {
      description:
        "This order has already been completed and cannot be updated",
      data: null,
    },
    success: {
      data: null,
    },
    error: {
      description: "partial fulfilment creation in db failed",
      data: null,
      error: null,
    },
  },

  fn: async function (
    inputs: {
      orderId: string;
      customerWalletAddress: string;
      retainItems: Array<number>;
      removeItems: Array<number>;
    },
    exits
  ) {
    const findOrderCriteria = {
      publicId: inputs.orderId,
      // paymentStatus: 'paid',
      customerWalletAddress: inputs.customerWalletAddress,
      // completedFlag: ''
    };
    let _originalOrder;
    try {
      _originalOrder = await Order.findOne(findOrderCriteria).populate(
        "items&discount&vendor&fulfilmentMethod"
      );
    } catch (error) {
      sails.log.error(
        `sails db threw trying to locate order from public id and walletAddress in helpers.updateItemsForOrder: ${error}`
      );
      return exits.orderNotFound({ data: `${error}` });
    }
    const originalOrder = _originalOrder;
    if (
      !originalOrder.vendor ||
      !originalOrder.fulfilmentMethod ||
      !originalOrder.items
    ) {
      return exits.error(
        new Error(
          "Original order has no " +
            (!originalOrder.vendor
              ? "vendor"
              : !originalOrder.fulfilmentMethod
              ? "fulfilmentMethod"
              : "items") +
            "???"
        )
      );
    }
    if (!originalOrder) {
      return exits.orderNotFound();
    } else if (originalOrder.paymentStatus !== "paid") {
      return exits.orderNotPaidFor({ data: originalOrder.paymentStatus });
    } else if (originalOrder.completedFlag !== "") {
      return exits.orderAlreadyCompleted({
        data: originalOrder.completedFlag,
      });
    }

    if (
      !inputs.retainItems ||
      !inputs.removeItems ||
      !Array.isArray(inputs.retainItems) ||
      !Array.isArray(inputs.removeItems)
    ) {
      return exits.badPartialFulfilmentRequestItems();
    }

    const arraysEqual = function (a, b) {
      try {
        if (a === b) {
          return true;
        }
        // eslint-disable-next-line eqeqeq
        if (a == null || b == null) {
          return false;
        }
        if (a.length !== b.length) {
          return false;
        }

        var ac = a.map((x) => x).sort();
        var bc = b.map((x) => x).sort();

        for (var i = 0; i < ac.length; ++i) {
          if (ac[i] !== bc[i]) {
            return false;
          }
        }
        return true;
      } catch (error) {
        sails.log.error(
          `helpers.updateItemsForOrder threw checking if request.[retainItems + removeItems] == order.items. See error: ${error}`
        );
        return false;
      }
    };

    const orderIds = originalOrder.items.map((item) => item.id);
    const partialFulfilCheckItems = [
      ...inputs.retainItems,
      ...inputs.removeItems,
    ];

    if (!arraysEqual(orderIds, partialFulfilCheckItems)) {
      return exits.success({ data: { validRequest: false } });
    }

    // Create the copy of the order object now before removing items on th new order
    try {
      const datastore = sails.getDatastore();

      const wrapWithDb = (db, cb) => {
        try {
          if (db) {
            return cb().usingConnection(db);
          } else {
            return cb();
          }
        } catch (error) {
          sails.log.error(
            `helpers.updateItemsForOrder threw updating the db with the child order clone: ${error}`
          );
        }
      };

      const createOrderTransactionDB = async (db: any) => {
        const newOrder = await wrapWithDb(db, () =>
          Order.create({
            total: 0.0, // * Set later!
            orderedDateTime: originalOrder.orderedDateTime,
            paidDateTime: originalOrder.paidDateTime,
            paymentStatus: originalOrder.paymentStatus,
            paymentIntentId: originalOrder.paymentIntentId,
            parentOrder: originalOrder.id,
            deliveryName: originalOrder.deliveryName,
            deliveryEmail: originalOrder.deliveryEmail,
            deliveryPhoneNumber: originalOrder.deliveryPhoneNumber,
            deliveryAddressLineOne: originalOrder.deliveryAddressLineOne,
            deliveryAddressLineTwo: originalOrder.deliveryAddressLineTwo,
            deliveryAddressCity: originalOrder.deliveryAddressCity,
            deliveryAddressPostCode: originalOrder.deliveryAddressPostCode,
            deliveryAddressInstructions:
              originalOrder.deliveryAddressInstructions,
            customerWalletAddress: originalOrder.customerWalletAddress,
            discount: originalOrder.discount ? originalOrder.discount.id : null,
            vendor: originalOrder.vendor ? originalOrder.vendor.id : null,
            fulfilmentMethod: originalOrder.fulfilmentMethod
              ? originalOrder.fulfilmentMethod.id
              : null,
            fulfilmentSlotFrom: originalOrder.fulfilmentSlotFrom,
            fulfilmentSlotTo: originalOrder.fulfilmentSlotTo,
            tipAmount: originalOrder.tipAmount,
          })
        ).fetch();
        // Strip unneccesary data from order items & copy to new order
        const originalOrderItems = originalOrder.items;

        var updatedItems = _.map(originalOrderItems, (originalOrderItem) => {
          originalOrderItem.order = newOrder.id;
          if(inputs.removeItems.includes(originalOrderItem.id)){
            originalOrderItem.unfulfilled = true;
            originalOrderItem.unfulfilledOnOrderId = originalOrder.id;
          } else {
            originalOrderItem.unfulfilled = false;
            originalOrderItem.unfulfilledOnOrderId = null;
          }
          originalOrderItem.order = newOrder.id;


          // retainItem.product = retainItem.product;
          return _.pick(originalOrderItem, [
            "order",
            "product",
            "optionValues",
            "unfulfilled",
            "unfulfilledOnOrderId",
          ]);
        });
        // Create each order item
        await wrapWithDb(db, () => OrderItem.createEach(updatedItems));
        // Calculate the order total on the backend
        var calculatedOrderTotal;
        try {
          calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({
            orderId: newOrder.id,
          });
        } catch (error) {
          sails.log.error(
            `helpers.updateItemsForOrder failed to calculateOrderTotal for new child order: ${error}`
          );
        }

        // Update with correct amount
        await wrapWithDb(db, () =>
          Order.updateOne(newOrder.id).set({
            total: calculatedOrderTotal.finalAmount,
          })
        );

        // Return error if vendor minimum order value not met
        if (
          calculatedOrderTotal.withoutFees <
          originalOrder.vendor.minimumOrderAmount
        ) {
          return exits.minimumOrderAmount(
            "Vendor minimum order value not met on partially fulfilled updated order"
          );
        }

        await wrapWithDb(db, () =>
          Order.updateOne(originalOrder.id).set({
            restaurantAcceptanceStatus: "partially fulfilled",
            completedFlag: "void",
          })
        );
        // Remove items from order that were not fulfilled by vendor
        // await wrapWithDb(db, () =>
        //   OrderItem.update({ 
        //     order: newOrder.id,
        //     id: [...inputs.removeItems],
        //   }).set({ unfulfilled: true, unfulfilledOnOrderId: originalOrder.id })
        // ).fetch();

        return {
          validRequest: true,
          calculatedOrderTotal: calculatedOrderTotal.finalAmount,
          orderId: newOrder.id,
          paymentIntentID: newOrder.paymentIntentId,
        };
      };

      if (datastore.config.adapter === "sails-disk") {
        const result = await createOrderTransactionDB(null);
        return exits.success({
          data: result,
        });
      } else {
        const result = await sails
          .getDatastore()
          .transaction(async (db) => {
            await createOrderTransactionDB(db);
          })
          .intercept((issues) => {
            sails.log(issues);
            return exits.error(new Error("Error creating Order in DB"));
          });
        return exits.success({
          data: result,
        });
      }
    } catch (error) {
      sails.log.error(error);
      return exits.error(
        new Error(
          "Error creating a child order in DB to set up a partial fulfilment"
        )
      );
    }
  },
};
