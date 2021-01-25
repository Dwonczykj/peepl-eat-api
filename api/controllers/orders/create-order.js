module.exports = {


  friendlyName: 'Create order',


  description: 'This action is responsible for the creation of new orders.',


  inputs: {
    items: {
      type: 'ref',
      description: 'Cart items from the frontend, which include the product id and corresponding delivery methods, options and relevant delivery slots.',
      required: true
    },
    address: {
      type: 'ref',
      description: 'The user\'s address.',
      required: true
    },
    total: {
      type: 'number',
      description: 'The total order value, including shipping. This will be calculated on the backend eventually.',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    for (var item in inputs.items) {
      inputs.items[item].optionValues = [];
      for (var option in inputs.items[item].options) {
        if(inputs.items[item].options[option] != "") {
          var newOptionValuePair = await OrderItemOptionValue.create({
            option: option,
            optionValue: inputs.items[item].options[option],
          }).fetch();
          inputs.items[item].optionValues.push(newOptionValuePair.id);
        }
      }
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
      customer: this.req.session.walletId
    }).fetch();

    var updatedItems = _.map(inputs.items, function(object) {
      object.product = object.id;
      object.order = order.id;

      // TODO: Reduce object from frontend so it contains IDs of associations only
      object.deliveryMethod = object.deliveryMethod.id;
      object.deliverySlot = object.deliverySlot.id;

      return _.pick(object, ['order', 'product', 'deliveryMethod', 'deliverySlot', 'optionValues']);
    });

    var products = await OrderItem.createEach(updatedItems);
    
    sails.sockets.join(this.req, 'order' + order.id, function(err){
      if(err) {
        return exits.error();
      }
    });

    var user = await User.findOne({walletId: this.req.session.walletId});
    
    // Create or update user record by walletId
    if(!user){
      await User.create({
        walletId: this.req.session.walletId,
        name: inputs.address.name,
        email: inputs.address.email,
        phoneNumber: inputs.address.phoneNumber,
        addressLineOne: inputs.address.lineOne,
        addressLineTwo: inputs.address.lineTwo,
        postcode: inputs.address.postCode
      });
    } else {
      await User.updateOne(user.id)
      .set({
        name: inputs.address.name,
        email: inputs.address.email,
        phoneNumber: inputs.address.phoneNumber,
        addressLineOne: inputs.address.lineOne,
        addressLineTwo: inputs.address.lineTwo,
        postcode: inputs.address.postCode
      });
    }

    // All done.
    return exits.success(order.id);

  }


};
