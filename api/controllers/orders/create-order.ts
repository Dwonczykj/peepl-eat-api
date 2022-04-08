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
    notFound: {
      responseType: 'notFound'
    },
  },


  fn: async function (inputs, exits) {
    // TODO: Validation (products belong to vendor, fulfilmentMethod belongs to vendor, timeslot is valid, options are related to products, optionvalues are valid for options)
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

    // TODO: Refactor all of this code to run concurrently where possible
    // TODO: Error handling here.
    for (var item in inputs.items) {
      inputs.items[item].optionValues = [];
      for (var option in inputs.items[item].options) {
        if(inputs.items[item].options[option] !== '') {
          // TODO: Change to append to array then use createEach
          var newOptionValuePair = await OrderItemOptionValue.create({
            option: option,
            optionValue: inputs.items[item].options[option],
          }).fetch();
          inputs.items[item].optionValues.push(newOptionValuePair.id);
        }
      }
    }

    var order;
    var discount;

    if(inputs.discountCode){
      // TODO: Return error if discount code is invalid
      discount = await sails.helpers.checkDiscountCode(inputs.discountCode, inputs.vendor);
    }

    // TODO: Check if vendor delivers to that area
    // TODO: Validate that fulfilment method belongs to vendor
    // TODO: Test this validation
    if(discount) {
      order = await Order.create({
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
        discount: discount.id,
        vendor: vendor.id,
        fulfilmentMethod: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
        tipAmount: inputs.tipAmount
      }).fetch();
    } else {
      order = await Order.create({
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
        vendor: vendor.id,
        fulfilmentMethod: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
        tipAmount: inputs.tipAmount
      }).fetch();
    }

    // Strip unneccesary data from order items
    var updatedItems = _.map(inputs.items, (object) => {
      object.product = object.id;
      object.order = order.id;

      return _.pick(object, ['order', 'product', 'optionValues']);
    });

    // Create each order item
    await OrderItem.createEach(updatedItems);

    // Calculate the order total on the backend
    var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({orderId: order.id});

    // If frontend total is incorrect
    if(order.total !== calculatedOrderTotal) {
      // TODO: Log any instances of this, as it shouldn't happen (indicated frontend logic error)
      sails.log('Order total mismatch');

      // Update with correct amount
      await Order.updateOne(order.id)
      .set({total: calculatedOrderTotal});
    }

    // Create PaymentIntent on Peepl Pay
    var newPaymentIntent = await sails.helpers.createPaymentIntent(calculatedOrderTotal,
      vendor.walletAddress,
      vendor.name
    );

    // Update order with payment intent
    await Order.updateOne(order.id)
    .set({paymentIntentId: newPaymentIntent.paymentIntentId});

    // All done.
    return exits.success({orderID: order.id, paymentIntentID: newPaymentIntent.paymentIntentId});

  }

};
