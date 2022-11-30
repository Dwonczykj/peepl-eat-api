import moment from 'moment';
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';
import { dateStrFormat, datetimeStrFormat, OrderItemType, OrderType, walletAddressString } from '../../../scripts/utils';

declare var Order: SailsModelType<OrderType>;
declare var sails: sailsVegi;

export type FormattedOrderForClients = ({
  items:
    | {
        id: number;
        unfulfilled: boolean;
        product: {
          name: string;
          basePrice: number;
          options: {
            name: string;
            chosenOption: string;
            priceModifier: number;
          }[];
        };
      }[]
    | any[];
  deliveryPartner: { id: number; name: string } | any;
  vendor: { id: number; name: string } | any;
  unfulfilledItems:
    | {
        id: number;
        methodType: 'delivery' | 'collection';
        priceModifier: number;
      }
    | any;
})[] | any;

export type ViewMyOrdersResponseType = {
  ongoingOrders: Array<FormattedOrderForClients>;
  scheduledOrders: Array<FormattedOrderForClients>;
}

const _exports = {
  friendlyName: 'View my orders',

  description: 'Display "My orders" page.',

  inputs: {
    walletId: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    success: {
      viewTemplatePath: 'pages/orders/my-orders',
    },
    successJSON: {
      statusCode: 200,
    },
  },

  fn: async function (
    inputs: {
      walletId: walletAddressString;
    },
    exits: {
      success: (unused: ViewMyOrdersResponseType) => ViewMyOrdersResponseType;
      successJSON: (
        unused: ViewMyOrdersResponseType
      ) => ViewMyOrdersResponseType;
    }
  ) {
    // const _orders = await Order.find({
    //   customerWalletAddress: inputs.walletId,
    //   paidDateTime: { '>': 0 },
    //   completedFlag: '',
    // }).populate(
    //   'fulfilmentMethod&deliveryPartner&vendor&items.product&optionValues&optionValues.option&optionValue'
    // );

    let _ongoingOrders: Array<OrderType>;
    let _scheduledOrders: Array<OrderType>;
    let timeNow = moment.utc().format(datetimeStrFormat); // e.g. 25/12/2022 09:00
    let timeToScheduledOrdersStart = moment
      .utc()
      .add(sails.config.custom.ongoingOrdersHoursCutoff, 'hours')
      .format(datetimeStrFormat); // e.g. 25/12/2022 17:00
    if (sails.getDatastore().config.adapter === 'sails-disk') {
      const _orders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        completedFlag: '',
      }).populate(
        'fulfilmentMethod&deliveryPartner&vendor&items.product&optionValues&optionValues.option&optionValue'
      );
      if (_orders.length > 0) {
        _ongoingOrders = _orders.filter((order) => {
          return (
            moment
              .utc(order.fulfilmentSlotFrom)
              .isSameOrAfter(moment.utc(timeNow, `${datetimeStrFormat}`)) &&
            moment
              .utc(order.fulfilmentSlotTo)
              .isSameOrBefore(
                moment.utc(timeToScheduledOrdersStart, `${datetimeStrFormat}`)
              )
          );
        });
        _scheduledOrders = _orders.filter((order) => {
          return moment
            .utc(order.fulfilmentSlotFrom)
            .isAfter(
              moment.utc(timeToScheduledOrdersStart, `${datetimeStrFormat}`)
            );
        });
      }
    } else {
      _ongoingOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        completedFlag: '',
        fulfilmentSlotFrom: { '>=': timeNow }, //BUG: this comparison doesnt work for disk db: sails-disk
        fulfilmentSlotTo: { '<=': timeToScheduledOrdersStart },
      }).populate(
        'fulfilmentMethod&deliveryPartner&vendor&items.product&optionValues&optionValues.option&optionValue'
      );
      _scheduledOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        completedFlag: '',
        fulfilmentSlotFrom: { '>': timeToScheduledOrdersStart },
      }).populate(
        'fulfilmentMethod&deliveryPartner&vendor&items.product&optionValues&optionValues.option&optionValue'
      );
    }

    const ordersMap = (orders: Array<OrderType>) =>
      orders.map((order) => {
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

    const ongoingOrders = ordersMap(_ongoingOrders);
    const scheduledOrders = ordersMap(_scheduledOrders);

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ ongoingOrders, scheduledOrders });
    } else {
      return exits.success({ ongoingOrders, scheduledOrders });
    }
  },
};

export type ViewMyOrdersResponseTestType = Awaited<ReturnType<typeof _exports.fn>>;

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
