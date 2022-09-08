import { ICourier } from '../../helpers/get-available-courier-from-pool';
var moment = require('moment');

/* eslint-disable camelcase */
declare var OrderItemOptionValue: any;
declare var OrderItem: any;
declare var Order: any;
declare var _: any;

module.exports = {


  friendlyName: 'Create order',


  description: 'This action is responsible for the creation of new orders.',


  inputs: {
    items: {
      type: 'ref',
      description: 'Cart items from the frontend, which include the product id and corresponding options.',
      required: true
    },
    address: {
      type: 'ref',
      description: 'The user\'s address.',
      required: true
    },
    total: {
      type: 'number',
      description: 'The total order value, including shipping.',
      required: true
    },
    marketingOptIn: {
      type: 'boolean'
    },
    discountCode: {
      type: 'string',
      required: false
    },
    vendor: {
      type: 'number',
      required: true
    },
    fulfilmentMethod: {
      type: 'number',
      required: true
    },
    fulfilmentSlotFrom: {
      type: 'string',
      description: 'Delivery after this time if delivery, collection from vendor after this time if collection',
      required: true
    },
    fulfilmentSlotTo: {
      type: 'string',
      description: 'Delivery before this time if delivery, collection from vendor before this time if collection',
      required: true
    },
    tipAmount: {
      type: 'number',
      defaultsTo: 0
    },
    walletAddress: {
      type: 'string',
      required: true
    }
  },


  exits: {
    invalidSlot: {
      statusCode: 400,
      description: 'The fulfilment slot is invalid.'
    },
    courierUnavailable: {
      statusCode: 400,
      description: 'No courier available.'
    },
    allItemsUnavailable: {
      statusCode: 400,
      description: 'All items are unavailable from merchant.'
    },
    minimumOrderAmount: {
      statusCode: 400,
      description: 'The minimum order amount was not met.'
    },
    noItemsFound: {
      statusCode: 400,
      responseType: 'noItemsFound'
    },
    notFound: {
      statusCode: 400,
      responseType: 'notFound'
    },
    badRequest: {
      responseType: 'badRequest'
    }
  },


  fn: async function (inputs, exits) {
    try{
      var orderValid = await sails.helpers.validateOrder.with(inputs);
    } catch (err) {
      return exits.badRequest(err);
    }

    let vendor = await Vendor.findOne({id: inputs.vendor});
    let discount;

    if(inputs.discountCode) {
      discount = await Discount.findOne({code: inputs.discountCode});
    }

    const isDelivery = (inputs.fulfilmentMethod === 1); // 2 is Collection

    if(inputs.discountCode) {
      discount = await Discount.findOne({code: inputs.discountCode});
    }

    const deliverAfter = moment(inputs.fulfilmentSlotFrom, 'YYYYMMdd hh:mm:ss'); //moment("01:15:00 PM", "h:mm:ss A")
    const deliverBefore = moment(inputs.fulfilmentSlotTo, 'YYYYMMdd hh:mm:ss'); //moment("01:15:00 PM", "h:mm:ss A")

    if(isDelivery){
      //TODO: Organise delivery with available courier
      const availableCourier: ICourier = await sails.helpers.getAvailableCourierFromPool
        .with({
          pickupFromVendor: vendor.id,
          deliverAfter: deliverAfter, //moment("01:15:00 PM", "h:mm:ss A")
          deliverBefore: deliverBefore, //moment("01:15:00 PM", "h:mm:ss A")

          deliveryContactName: inputs.address.name,
          deliveryPhoneNumber: inputs.address.phoneNumber,
          deliveryComments: inputs.address.deliveryInstructions,

          deliveryAddressLineOne: inputs.address.lineOne,
          deliveryAddressLineTwo: inputs.address.lineTwo,
          deliveryAddressCity: '',
          deliveryAddressPostCode: inputs.address.postCode,

        });

      if (!availableCourier) {
        return exits.invalidSlot('No courier available for requested fulfilment');
      }
    }

    // ! Merchant fulfilment check done by merchant after receiveing the SMS and they click the link /orders/peepl-pay-webhook which itself is a callback from /helpers/create-payment-intent

    await sails.getDatastore()
    .transaction(async (db: any)=> {
      // TODO: Error handling here.
      for (var item in inputs.items) {
        var orderItemOptionValues = [];
        for (var option in inputs.items[item].options) { // options is a dictionary of <string, int> where the int is the selectedProductOptions.id
          orderItemOptionValues.push({
            option: option,
            optionValue: inputs.items[item].options[option],
          });
        }

        var newOrderItemOptionValues = await OrderItemOptionValue.createEach(orderItemOptionValues)
          .usingConnection(db)
          .fetch();

        // Get array of IDs from array of newOrderItemOptionValues
        inputs.items[item].optionValues = newOrderItemOptionValues.map(({id: number}) => number);
      }

      var order = await Order.create({
        total: inputs.total,
        orderedDateTime: Date.now(),
        deliveryName: inputs.address.name,
        deliveryEmail: inputs.address.email,
        deliveryPhoneNumber: inputs.address.phoneNumber,
        deliveryAddressLineOne: inputs.address.lineOne,
        deliveryAddressLineTwo: inputs.address.lineTwo,
        deliveryAddressPostCode: inputs.address.postCode,
        deliveryAddressInstructions: inputs.address.deliveryInstructions,
        customerWalletAddress: inputs.walletAddress,
        discount: (discount) ? discount.id : undefined,
        vendor: vendor.id,
        fulfilmentMethod: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
        tipAmount: inputs.tipAmount
      })
      .usingConnection(db)
      .fetch();

      // Strip unneccesary data from order items
      var updatedItems = _.map(inputs.items, (object) => {
        object.order = order.id;
        object.product = object.id;

        return _.pick(object, ['order', 'product', 'optionValues']);
      });

      // Create each order item
      await OrderItem.createEach(updatedItems)
        .usingConnection(db);

      // Calculate the order total on the backend
      var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({orderId: order.id});

      // If frontend total is incorrect
      if(order.total !== calculatedOrderTotal.finalAmount) {
        // TODO: Log any instances of this, as it shouldn't happen (indicated frontend logic error)
        sails.log.info('Order total mismatch');

        // Update with correct amount
        await Order.updateOne(order.id)
        .set({total: calculatedOrderTotal.finalAmount})
        .usingConnection(db);
      }

      // Return error if vendor minimum order value not met
      if(calculatedOrderTotal.withoutFees < vendor.minimumOrderAmount) {
        return exits.minimumOrderAmount('Vendor minimum order value not met');
      }

      // Create PaymentIntent on Peepl Pay
      // TODO: error handling
      var newPaymentIntent = await sails.helpers.createPaymentIntent(
        calculatedOrderTotal.finalAmount,
        vendor.walletAddress, //pushes an update to user via firebase when order has comnpleted via peeplPay posting back to peeplEatWebHook
        vendor.name
      )
      .catch(() => {
        return exits.error(new Error('Error creating payment intent'));
      });

      if(!newPaymentIntent) {
        return exits.error(new Error('Error creating payment intent'));
      }

      // Update order with payment intent
      await Order.updateOne(order.id)
      .set({paymentIntentId: newPaymentIntent.paymentIntentId})
      .usingConnection(db);

      // All done.
      return exits.success({orderID: order.id, paymentIntentID: newPaymentIntent.paymentIntentId});
    });
  }

};
