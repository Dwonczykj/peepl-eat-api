
/* eslint-disable camelcase */
declare var OrderItemOptionValue: any;
declare var OrderItem: any;
declare var Order: any;
// declare var _: any;
import _ from 'lodash';
// import util from 'util';

module.exports = {
  friendlyName: "Create order",

  description: "This action is responsible for the creation of new orders.",

  inputs: {
    items: {
      type: "ref",
      description:
        "Cart items from the frontend, which include the product id and corresponding options.",
      required: true,
    },
    address: {
      type: "ref",
      description: "The user's address.",
      required: true,
    },
    total: {
      type: "number",
      description: "The total order value, including shipping.",
      required: true,
    },
    marketingOptIn: {
      type: "boolean",
    },
    discountCode: {
      type: "string",
      required: false,
    },
    vendor: {
      type: "number",
      required: true,
    },
    fulfilmentMethod: {
      type: "number",
      required: true,
    },
    fulfilmentSlotFrom: {
      type: "string",
      description:
        "Delivery after this time if delivery, collection from vendor after this time if collection",
      required: true,
    },
    fulfilmentSlotTo: {
      type: "string",
      description:
        "Delivery before this time if delivery, collection from vendor before this time if collection",
      required: true,
    },
    tipAmount: {
      type: "number",
      defaultsTo: 0,
    },
    walletAddress: {
      type: "string",
      required: true,
    },
  },

  exits: {
    invalidSlot: {
      statusCode: 422,
      description: "The fulfilment slot is invalid.",
    },
    deliveryPartnerUnavailable: {
      statusCode: 422,
      description: "No deliveryPartner available.",
    },
    allItemsUnavailable: {
      statusCode: 422,
      description: "All items are unavailable from merchant.",
    },
    minimumOrderAmount: {
      statusCode: 400,
      description: "The minimum order amount was not met.",
    },
    noItemsFound: {
      statusCode: 400,
      responseType: "noItemsFound",
    },
    badItemsRequest: {
      responseType: "badRequest",
      statusCode: 400,
    },
    notFound: {
      statusCode: 400,
      responseType: "notFound",
    },
    badRequest: {
      responseType: "badRequest",
    },
  },

  fn: async function (inputs, exits) {
    try {
      await sails.helpers.validateOrder.with(inputs);
    } catch (err) {
      return exits.badRequest(err);
    }

    let vendor = await Vendor.findOne({ id: inputs.vendor });
    let discount;

    if (inputs.discountCode) {
      discount = await Discount.findOne({ code: inputs.discountCode });
    }

    const vendorFulfilmentMethod = await FulfilmentMethod.findOne(inputs.fulfilmentMethod).populate('vendor');

    if (vendorFulfilmentMethod.vendor.id !== inputs.vendor){
      return exits.badRequest('Vendor did not match the vendor on the requested fulfilment method');
    }

    const isDelivery = vendorFulfilmentMethod.methodType === 'delivery';

    let availableDeliveryPartner;
    if (isDelivery) {
      try {
	      availableDeliveryPartner =
	        await sails.helpers.getAvailableDeliveryPartnerFromPool.with({
	          fulfilmentSlotFrom: inputs.fulfilmentSlotFrom, //moment.utc("01:15:00 PM", "h:mm:ss A")
	          fulfilmentSlotTo: inputs.fulfilmentSlotTo, //moment.utc("01:15:00 PM", "h:mm:ss A")
	          
	          pickupFromVendor: vendor.id,
	
	          deliveryContactName: inputs.address.name,
	          deliveryPhoneNumber: inputs.address.phoneNumber,
	          deliveryComments: inputs.address.deliveryInstructions,
	
	          deliveryAddressLineOne: inputs.address.lineOne,
	          deliveryAddressLineTwo: inputs.address.lineTwo,
	          deliveryAddressCity: inputs.address.city,
	          deliveryAddressPostCode: inputs.address.postCode,
	        });
      } catch (error) {
        sails.log.error(`helpers.getAvailableDeliveryPartnerFromPool errored: ${error}`);
        availableDeliveryPartner = null;
      }
      sails.log(
        "create order for delivery using DP: " +
          availableDeliveryPartner.name
      );
      if (!availableDeliveryPartner) {
        return exits.invalidSlot(
          "No deliveryPartner available for requested fulfilment"
        );
      }
    } else {
      availableDeliveryPartner = null;
    }

    if (inputs.discountCode) {
      discount = await Discount.findOne({ code: inputs.discountCode });
    }

    sails.log("using discount:" + inputs.discountCode);

    // ! Merchant fulfilment check done by merchant after receiveing the SMS and they click the link /orders/peepl-pay-webhook which itself is a callback from /helpers/create-payment-intent

    try {
      const datastore = sails.getDatastore();
      
      const wrapWithDb = (db, cb) => {
        if(db){
          return cb().usingConnection(db);
        } else {
          return cb();
        }
      };
      
      const createOrderTransactionDB = async (db: any) => {
	      // TODO: Error handling here.
	      sails.log(`Create the order items in the db`);
	      for (var item in inputs.items) {
	        var orderItemOptionValues = [];
	        for (var option in inputs.items[item].options) {
	          // options is a dictionary of <string, int> where the int is the selectedProductOptions.id
	          orderItemOptionValues.push({
	            option: option,
	            optionValue: inputs.items[item].options[option],
	          });
	        }
	        var newOrderItemOptionValues = [];
	        try {
	          newOrderItemOptionValues = await wrapWithDb(db, () => OrderItemOptionValue.createEach(
	            orderItemOptionValues
	          )).fetch();
	        } catch (err) {
	          sails.log.error(err);
	          exits.badItemsRequest();
	          return;
	        }
	
	        // Get array of IDs from array of newOrderItemOptionValues
	        inputs.items[item].optionValues = newOrderItemOptionValues.map(
	          ({ id: number }) => number
	        );
	      }
	      sails.log(`Create the order in the db`);
	      var order = await wrapWithDb(db, () =>
          Order.create({
            total: inputs.total,
            orderedDateTime: Date.now(),
            deliveryAccepted: !!availableDeliveryPartner,
            deliveryPartner: availableDeliveryPartner.id,
            deliveryName: inputs.address.name,
            deliveryEmail: inputs.address.email,
            deliveryPhoneNumber: inputs.address.phoneNumber,
            deliveryAddressLineOne: inputs.address.lineOne,
            deliveryAddressLineTwo: inputs.address.lineTwo,
            deliveryAddressCity: inputs.address.city,
            deliveryAddressPostCode: inputs.address.postCode,
            deliveryAddressInstructions: inputs.address.deliveryInstructions,
            customerWalletAddress: inputs.walletAddress,
            discount: discount ? discount.id : undefined,
            vendor: vendor.id,
            fulfilmentMethod: inputs.fulfilmentMethod,
            fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
            fulfilmentSlotTo: inputs.fulfilmentSlotTo,
            tipAmount: inputs.tipAmount,
          })
        ).fetch();
        
	      // Strip unneccesary data from order items
	      var updatedItems = _.map(inputs.items, (object) => {
	        object.order = order.id;
	        // object.product = object.product;
	
	        return _.pick(object, ["order", "product", "optionValues"]);
	      });
	
        // sails.log(`Update the ${updatedItems.length} order items in the db: ${util.inspect(updatedItems, {depth: null})}`);
	      // Create each order item
	      await wrapWithDb(db, () => OrderItem.createEach(updatedItems));
	
        sails.log(`Calculate the order total now`);
	      // Calculate the order total on the backend
	      var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({
	        orderId: order.id,
	      });
	
	      // If frontend total is incorrect
	      if (order.total !== calculatedOrderTotal.finalAmount) {
	        // TODO: Log any instances of this, as it shouldn't happen (indicated frontend logic error)
	        sails.log.info(`Order total mismatch`);
	        sails.log.info(
            `Order total is ${order.total} but is calculated to be total ${calculatedOrderTotal.finalAmount}`
          );
	
	        // Update with correct amount
	        await wrapWithDb(db, () =>
            Order.updateOne(order.id).set({
              total: calculatedOrderTotal.finalAmount,
            })
          );
	      }
	
	      // Return error if vendor minimum order value not met
	      if (calculatedOrderTotal.withoutFees < vendor.minimumOrderAmount) {
          sails.log.info("Vendor minimum order value not met");
	        return exits.minimumOrderAmount("Vendor minimum order value not met");
	      }
	
	      // Create PaymentIntent on Peepl Pay
	      // TODO: error handling
	      var newPaymentIntent = await sails.helpers
	        .createPaymentIntent(
	          calculatedOrderTotal.finalAmount,
	          vendor.walletAddress, //pushes an update to user via firebase when order has comnpleted via peeplPay posting back to peeplEatWebHook
	          vendor.name
	        )
	        .catch(() => {
	          return exits.error(new Error("Error creating payment intent"));
	        });
	
	      if (!newPaymentIntent) {
	        return exits.error(new Error("Error creating payment intent"));
	      }
	
	      // Update order with payment intent
	      await wrapWithDb(db, () =>
          Order.updateOne(order.id).set({
            paymentIntentId: newPaymentIntent.paymentIntentId,
          })
        );
	
	      // All done.
	      return exits.success({
	        orderID: order.id,
	        paymentIntentID: newPaymentIntent.paymentIntentId,
	      });
      };
      
      if(datastore.config.adapter === 'sails-disk'){
        createOrderTransactionDB(null);
      } else {
        await sails.getDatastore().transaction(async (db) => {
          createOrderTransactionDB(db);
        }).intercept((issues) => {
          sails.log(issues);
          return exits.error(new Error("Error creating Order in DB"));
        });
      }
    } catch (error) {
      sails.log.error(error);
      return exits.error(new Error("Error creating Order in DB"));
    }
  },
};
