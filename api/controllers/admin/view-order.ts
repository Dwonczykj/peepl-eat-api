// declare var Order: any;

import { OrderType } from "scripts/utils";

// declare var User: any;
module.exports = {
  friendlyName: "View order",

  description: 'Display "order" page.',

  inputs: {
    orderId: {
      type: "string",
      description: "The public id of the order to view.",
      required: true,
    },
  },

  exits: {
    success: {
      viewTemplatePath: "pages/orders/view-order",
    },
    successJSON: {
      statusCode: 200,
    },
    badRequest: {
      responseType: "unauthorised",
      statusCode: 401,
      description: "user not allowed to see vendor or vendor orders",
    },
    notFound: {
      statusCode: 404,
    },
  },

  fn: async function (
    inputs: {
      orderId: string;
    },
    exits: {
      success: (unusedArg: { order: OrderType }) => OrderType;
      successJSON: (unusedArg: { order: OrderType }) => OrderType;
      notFound: (unusedArg?: Error | string) => void;
      badRequest: (unusedArg?: Error | string) => void;
    }
  ) {
    var order = await Order.findOne({
      publicId: inputs.orderId,
      completedFlag: "",
    }).populate(
      "fulfilmentMethod&vendor&items.product&optionValues&optionValues.option&optionValue"
    );

    if (!order) {
      return exits.notFound();
    }

    let user = await User.findOne(this.req.session.userId);
    let authorized = false;
    try {
      authorized = await sails.helpers.isAuthorisedForVendor.with({
        userId: user.id,
        vendorId: order.vendor.id,
      });
    } catch (error) {
      sails.log.error(`sails.helpers.isAuthorisedForVendor errored: ${error}`);
    }
    if (!authorized) {
      return exits.badRequest();
    }
    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ order });
    } else {
      return exits.success({ order });
    }
  },
};
