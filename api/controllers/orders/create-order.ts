/* eslint-disable camelcase */
declare var OrderItemOptionValue: any;
declare var OrderItem: any;
declare var Order: any;
declare var Discount: any;
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
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    /* var mailchimp = require('@mailchimp/mailchimp_marketing');
    var md5 = require('md5'); */

    // TODO: Validation (products belong to vendor, fulfilmentMethod belongs to vendor, timeslot is valid, options are related to products, optionvalues are valid for options)

    var vendor = await Vendor.findOne(inputs.vendor);

    if(!vendor) {
      return exits.error();
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

    var discount;
    var order;

    if(inputs.discountCode){
      var discountDb = await Discount.findOne({code: inputs.discountCode});
      var currentTime = new Date().getTime();

      // Check validity
      if(discountDb && (discountDb.expiryDateTime === 0 || discountDb.expiryDateTime >= currentTime) && (discountDb.maxUses === 0 || discountDb.timesUsed < discountDb.maxUses)){
        discount = discountDb;
      }
    }

    // TODO: Validate that fulfilment method belongs to vendor
    // TODO: Validate fulfilment slot times
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
        customerWalletAddress: this.req.session.walletId,
        discount: discount.id,
        vendor: vendor.id,
        fulfilmentMethod: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
      }).fetch()
      .intercept({name: 'UsageError'}, (err) => {
        console.log(err);
        // TODO: Give more specific error
        return 'invalid';
      });
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
        customerWalletAddress: this.req.session.walletId,
        vendor: vendor.id,
        fulfilmentMethod: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
      }).fetch()
      .intercept({name: 'UsageError'}, (err) => {
        console.log(err);
        // TODO: Give more specific error
        return 'invalid';
      });
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
      await Order.updateOne(order.id)
      .set({total: calculatedOrderTotal});
    }

    /* if(inputs.marketingOptIn) {
      mailchimp.setConfig({
        apiKey: sails.config.custom.mailchimpAPIKey,
        server: 'us7'
      });

      var customerEmailMd5 = md5(inputs.address.email.toLowerCase());
      var listId = 'e538a63177'; // Peepl Newsletter

      mailchimp.lists.setListMember(listId, customerEmailMd5, {
        email_address: inputs.address.email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: inputs.address.name,
          POSTCODE: inputs.address.postCode
        }
      })
      .catch((err) => {
        console.log(err);
      });
    } */


    // Create PaymentIntent on Peepl Pay
    var paymentIntentId = await sails.helpers.createPaymentIntent(calculatedOrderTotal,
      vendor.walletAddress,
      vendor.name
    );

    await Order.updateOne(order.id)
    .set({paymentIntentId: paymentIntentId});

    // All done.
    return exits.success({orderID: order.id, paymentIntentID: paymentIntentId});

  }

};
