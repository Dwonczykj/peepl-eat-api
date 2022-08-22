declare var Order: any;
declare var User: any;
module.exports = {

  friendlyName: 'View orders',

  description: 'Display "orders" page.',

  inputs: {
    acceptanceStatus: {
      type: 'string',
      description: 'The acceptance status of the order',
      isIn: ['accepted', 'rejected', 'pending'],
    },
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/all-orders'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    let user = await User.findOne(this.req.session.userId);
    let orders;

    if(user.isSuperAdmin){
      // Show orders for all vendors
      if(!inputs.acceptanceStatus){
        orders = await Order.find({paidDateTime: {'>': 0}})
        .sort('paidDateTime DESC')
        .populate('items.product&optionValues&optionValues.option&optionValue');
      } else {
        orders = await Order.find({restaurantAcceptanceStatus: inputs.acceptanceStatus, paidDateTime: {'>': 0}})
        .sort('paidDateTime DESC')
        .populate('items.product&optionValues&optionValues.option&optionValue');
      }
    } else {
      // Only show orders for vendor that the user is associated with
      if(!inputs.acceptanceStatus){
        orders = await Order.find({paidDateTime: {'>': 0}, vendor: user.vendor})
        .sort('paidDateTime DESC')
        .populate('items.product&optionValues&optionValues.option&optionValue');
      } else {
        orders = await Order.find({restaurantAcceptanceStatus: inputs.acceptanceStatus, paidDateTime: {'>': 0}, vendor: user.vendor})
        .sort('paidDateTime DESC')
        .populate('items.product&optionValues&optionValues.option&optionValue');
      }
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {orders}
      );
    } else {
      return exits.success({acceptanceStatus: inputs.acceptanceStatus, orders});
    }

  }

};
