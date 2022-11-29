import { SailsModelType } from '../../../api/interfaces/iSails';
import { OrderType, walletAddressString } from "../../../scripts/utils";

declare var Order: SailsModelType<OrderType>;

const _exports = {

  friendlyName: 'View my orders',

  description: 'Display "My orders" page.',

  inputs: {
    walletId: {
      type: 'string',
      required: true
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/orders/my-orders'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs: {
    walletId: walletAddressString;
  }, exits: {
    success: <T>(unused: T) => T;
    successJSON: <T>(unused: T) => T;
  }) {
    const _orders = await Order.find({
      customerWalletAddress: inputs.walletId,
      paidDateTime: {'>': 0},
      completedFlag: '',
    })
    .populate('fulfilmentMethod&deliveryPartner&vendor&items.product&optionValues&optionValues.option&optionValue');

    const orders = _orders.map(order => {
      return {
        ...order,
        ...{
          items: order.items.map((orderItem) => {
            return {
              id: orderItem.id,
              unfulfilled: orderItem.unfulfilled,
              product: {
                name: orderItem.product.name,
                basePrice: orderItem.product.basePrice,
                options: orderItem.optionValues.map((optionValue) => {
                  return {
                    name: optionValue.option.name,
                    chosenOption: optionValue.optionValue.name,
                    priceModifier: optionValue.optionValue.priceModifier,
                  };
                }),
              },
            };
          }),
          deliveryPartner: order.deliveryPartner && {
            id: order.deliveryPartner.id,
            name: order.deliveryPartner.name,
          },
          vendor: {
            id: order.vendor.id,
            name: order.vendor.name,
          },
          fulfilmentMethod: {
            id: order.fulfilmentMethod.id,
            methodType: order.fulfilmentMethod.methodType,
            priceModifier: order.fulfilmentMethod.priceModifier,
          },
          // todo: gbpxUsed, didUsePPL, pplUsed, pplRewardsEarned, pplRewardsEarnedValue;
        },
      };
    });

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {orders}
      );
    } else {
      return exits.success({orders});
    }
  }

};

export type ViewMyOrdersResponseType = Awaited<ReturnType<typeof _exports.fn>>;
export type testInputs = {
  [key in keyof typeof _exports.inputs]: typeof _exports.inputs[key]['type'] extends 'string'
    ? string
    : typeof _exports.inputs[key]['type'] extends 'number'
    ? number
    : typeof _exports.inputs[key]['type'] extends 'boolean'
    ? boolean
    : any;
} & {
  // ... type overrides here
};

module.exports = _exports;
