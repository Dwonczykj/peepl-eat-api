/* eslint-disable camelcase */
declare var User: any;
declare var OrderItemOptionValue: any;
declare var OrderItem: any;
declare var Order: any;
declare var Discount: any;
const axios = require('axios').default;

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

    var vendor = await Vendor.findOne(inputs.vendor);

    if(!vendor) {
      throw 'invalidVendor';
    }

    // TODO: Refactor all of this code to run concurrently where possible
    // TODO: Error handling here.
    for (var item in inputs.items) {
      inputs.items[item].optionValues = [];
      // TODO: Refactor to batch SQL query
      for (var option in inputs.items[item].options) {
        if(inputs.items[item].options[option] !== '') {
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
        customerWalletAddress: this.req.session.walletId,
        vendor: vendor.id,
        fulfilmentMethod: inputs.fulfilmentMethod,
        fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
        fulfilmentSlotTo: inputs.fulfilmentSlotTo,
      }).fetch();
    }

    var updatedItems = _.map(inputs.items, (object) => {
      object.product = object.id;
      object.order = order.id;

      return _.pick(object, ['order', 'product', 'optionValues']);
    });

    await OrderItem.createEach(updatedItems);

    // Calculate the order total on the backend
    var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({orderId: order.id});

    if(order.total !== calculatedOrderTotal) {
      // TODO: Log any instances of this, as it shouldn't happen (indicated frontend logic error)
      await Order.updateOne(order.id)
      .set({total: calculatedOrderTotal});
    }

    /* // Subscribe calling websocket to order room
    sails.sockets.join(this.req, 'order' + order.id, (err) => {
      if(err) {
        return exits.error();
      }
    }); */


    /* var user = await User.findOne({walletId: this.req.session.walletId});

    // Create or update user record by walletId
    if(!user){
      await User.create({
        walletId: this.req.session.walletId,
        name: inputs.address.name,
        email: inputs.address.email,
        phoneNumber: inputs.address.phoneNumber,
        addressLineOne: inputs.address.lineOne,
        addressLineTwo: inputs.address.lineTwo,
        postcode: inputs.address.postCode,
        marketingOptIn: inputs.marketingOptIn
      });
    } else {
      if(user.marketingOptIn) {inputs.marketingOptIn = true;} // Ignore missing opt-in if user already opted in
      await User.updateOne(user.id)
      .set({
        name: inputs.address.name,
        email: inputs.address.email,
        phoneNumber: inputs.address.phoneNumber,
        addressLineOne: inputs.address.lineOne,
        addressLineTwo: inputs.address.lineTwo,
        postcode: inputs.address.postCode,
        marketingOptIn: inputs.marketingOptIn
      });
    } */

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
    // TODO: Move this to helper

    /* const instance = axios.create({
      baseURL: 'http://pay.itsaboutpeepl.com/api/v1',
      // timeout: 1000,
      headers: {'Authorization': 'Basic OlFGQVJYWVktMkRSNE0xMy1QM0ZUQ1BULTQ0TVQ1UTI='}
    });

    instance.post('/payment_intents', {
      amount: calculatedOrderTotal,
      recipientWalletAddress: '0xf039CD9391cB28a7e632D07821deeBc249a32410',
      vendorDisplayName: 'Peepl',
      webhookAddress: 'http://app.itaboutpeepl.com/api/v1/orders/peepl-pay-webhook?wallet=test'
    })
    .then(async (response) => {
      var paymentIntentId = response.data.paymentIntent.publicId;
      await Order.updateOne(order.id)
      .set({paymentIntentId: paymentIntentId});

      // All done.
      return exits.success({orderID: order.id, paymentIntentID: paymentIntentId});
    })
    .catch((err) => {
      console.log(err);
    }); */

    return exits.success({orderID: order.id, paymentIntentID: undefined});

  }

};
