// declare var Order: any;
// declare var User: any;
module.exports = {

  friendlyName: 'View order',

  description: 'Display "order" page.',

  inputs: {
    orderId: {
      type: 'string',
      description: 'The public id of the order to view.',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/view-order'
    },
    successJSON: {
      statusCode: 200,
    },
    badRequest: {
      responseType: 'unauthorised',
      description: 'user not allowed to see vendor or vendor orders'
    },
    notFound: {
      statusCode: 404,
    }
  },

  fn: async function (inputs, exits) {

    var order = await Order.findOne({
      publicId: inputs.orderId,
      completedFlag: ''
    })
    .populate('fulfilmentMethod&items.product&optionValues&optionValues.option&optionValue&vendor.id');

    if(!order){
      return exits.notFound();
    }

    let user = await User.findOne(this.req.session.userId);

    if (!sails.helpers.isAuthorisedForVendor.with({userId: user.id, vendorId: order.vendor.id})){
      return exits.badRequest();
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {order}
      );
    } else {
      return exits.success({order});
    }

  }

};
