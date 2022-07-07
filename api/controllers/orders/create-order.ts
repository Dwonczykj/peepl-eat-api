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
      required: true
    },
    fulfilmentSlotTo: {
      type: 'string',
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
    minimumOrderAmount: {
      statusCode: 400,
      description: 'The minimum order amount was not met.'
    },
    notFound: {
      responseType: 'notFound'
    },
  },


  fn: async function (inputs, exits) {
    // TODO: Validation (products belong to vendor, fulfilmentMethod belongs to vendor, options are related to products, optionvalues are valid for options)
    var vendor = await Vendor.findOne(inputs.vendor);

    if(!vendor) {
      return exits.notFound();
    }

    var slotsValid = await sails.helpers.validateDeliverySlot
      .with({
        fulfilmentMethodId: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo
      });

    if(!slotsValid){
      return exits.invalidSlot('Invalid delivery slot');
    }

    var discountId: number;
    if(inputs.discountCode){
      // TODO: Return error if discount code is invalid
      var discount = await sails.helpers.checkDiscountCode(inputs.discountCode, inputs.vendor);
      discountId = discount.id;
    }

    await sails.getDatastore()
    .transaction(async (db: any)=> {
      // TODO: Error handling here.
      for (var item in inputs.items) {
        var orderItemOptionValues = [];
        for (var option in inputs.items[item].options) {
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

      // TODO: Check if vendor delivers to that area
      // TODO: Validate that fulfilment method belongs to vendor
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
        discount: discountId,
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
        sails.log('Order total mismatch');

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
        vendor.walletAddress,
        vendor.name
      )
      .catch(() => {
        return exits.error('Error creating payment intent');
      });

      if(!newPaymentIntent) {
        return exits.error('Error creating payment intent');
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
