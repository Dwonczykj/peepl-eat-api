import { SailsModelType, sailsVegi } from "../../../api/interfaces/iSails";
import { OrderType } from "../../../scripts/utils";

declare var Order: SailsModelType<OrderType>;
declare var sails: sailsVegi;
// declare var User: any;
module.exports = {

  friendlyName: 'View orders',

  description: 'Display "orders" page.',

  inputs: {
    acceptanceStatus: {
      type: 'string',
      description: 'The acceptance status of the order',
      isIn: ['accepted', 'rejected', 'pending', 'delivered', 'out for delivery', 'collected'],
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
    let orders;

    try {
      orders = await sails.helpers.getOrders.with(inputs);
    } catch (error) {
      sails.log.error(error);
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({
        orders
      });
    } else {
      return exits.success({
        acceptanceStatus: inputs.acceptanceStatus, 
        timePeriod: inputs.timePeriod, 
        orders
      });
    }

  }

};
