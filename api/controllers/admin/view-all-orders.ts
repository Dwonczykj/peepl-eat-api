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
    timePeriod: {
      type: 'string',
      description: 'The time period of the order',
      isIn: ['upcoming', 'past', 'all'],
    }
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

    let criteria = {
      paidDateTime: {'>': 0},
      restaurantAcceptanceStatus: undefined,
      vendor: undefined,
      fulfilmentSlotFrom: undefined,
      fulfilmentSlotTo: undefined,
    };

    // Sort by fulfilment time ascending
    let sort = 'fulfilmentSlotFrom ASC';

    if(!user.isSuperAdmin) {
      criteria.vendor = user.vendor;
    }
    if(inputs.acceptanceStatus) {
      criteria.restaurantAcceptanceStatus = inputs.acceptanceStatus;
    }
    if(inputs.timePeriod === 'upcoming') {
      criteria.fulfilmentSlotTo = {
        '>=': new Date()
      };
    }
    if(inputs.timePeriod === 'past') {
      // Sort by fulfilment time descending
      sort = 'fulfilmentSlotFrom DESC';
      criteria.fulfilmentSlotTo = {
        '<': new Date()
      };
    }

    orders = await Order.find(criteria)
    .sort(sort)
    .populate('fulfilmentMethod&items.product&optionValues&optionValues.option&optionValue');

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {orders}
      );
    } else {
      return exits.success({acceptanceStatus: inputs.acceptanceStatus, timePeriod: inputs.timePeriod, orders});
    }

  }

};
