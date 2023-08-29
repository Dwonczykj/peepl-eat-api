import moment from 'moment';
import { SailsModelType, sailsModelKVP, sailsVegi } from '../../../api/interfaces/iSails';
import { AccountType, dateStrFormat, datetimeStrFormat, DiscountType, OrderItemType, OrderType, TransactionType, VendorType, walletAddressString } from '../../../scripts/utils';
import { TransactionsForAccountResult } from '../../../api/helpers/transactions-for-account';

declare var Order: SailsModelType<OrderType>;
declare var OrderItem: SailsModelType<OrderItemType>;
declare var Account: SailsModelType<AccountType>;
declare var Transaction: SailsModelType<TransactionType>;
declare var Discount: SailsModelType<DiscountType>;
declare var sails: sailsVegi;

export type FormattedOrderForClients = ({
  items:
    | {
        id: number;
        unfulfilled: boolean;
        product: {
          id: number;
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
  transactions: TransactionType[],
  fulfilmentCharge: number,
  platformFee: number,
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
  unpaidOrders: Array<FormattedOrderForClients>;
  pastOrders: Array<FormattedOrderForClients>;
  allMyOrders: Array<FormattedOrderForClients>;
  userRole: any;
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
    //   completedFlag: 'none',
    // }).populate(
    //   'fulfilmentMethod&deliveryPartner&vendor&items.product&optionValues&optionValues.option&optionValue'
    // );

    let _ongoingOrders: Array<OrderType>;
    let _scheduledOrders: Array<OrderType>;
    let _pastOrders: Array<OrderType>;
    let _allMyOrders: Array<OrderType>;
    let _unpaidOrders: Array<OrderType>;
    let timeNow = moment.utc().format(datetimeStrFormat); // e.g. 25/12/2022 09:00
    let timeToScheduledOrdersStart = moment
      .utc()
      .add(sails.config.custom.ongoingOrdersHoursCutoff, 'hours')
      .format(datetimeStrFormat); // e.g. 25/12/2022 17:00
    if (sails.getDatastore().config.adapter === 'sails-disk') {
      const _orders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        completedFlag: 'none',
      })
        // .populate('items&items.product')
        // .populate('items&items.optionValues&optionValues.option&optionValue')
        .populate(
          'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
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
        _pastOrders = _orders.filter((order) => {
          return moment
            .utc(order.fulfilmentSlotFrom)
            .isSameOrBefore(
              moment.utc(timeToScheduledOrdersStart, `${datetimeStrFormat}`)
            );
        });
        _allMyOrders = _orders;
        _unpaidOrders = _orders.filter((order) => {
          return order.paymentStatus !== 'paid' && !order.paidDateTime;
        });
      }
    } else {
      _ongoingOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        completedFlag: 'none',
        fulfilmentSlotFrom: { '>=': timeNow },
        fulfilmentSlotTo: { '<=': timeToScheduledOrdersStart },
      })
        // .populate('items&items.product')
        // .populate('items&items.optionValues&optionValues.option&optionValue')
        .populate(
          'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
        );
      _scheduledOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        completedFlag: 'none',
        fulfilmentSlotFrom: { '>': timeToScheduledOrdersStart },
      })
        // .populate('items&items.product')
        // .populate('items&items.optionValues&optionValues.option&optionValue')
        .populate(
          'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
        );
      _pastOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
        fulfilmentSlotFrom: { '<=': timeToScheduledOrdersStart },
      })
        // .populate('items&items.product')
        // .populate('items&items.optionValues&optionValues.option&optionValue')
        .populate(
          'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
        );
      _allMyOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paidDateTime: { '>': 0 },
      })
        // .populate('items&items.product')
        // .populate('items&items.optionValues&optionValues.option&optionValue')
        .populate(
          'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
        );
      _unpaidOrders = await Order.find({
        customerWalletAddress: inputs.walletId,
        paymentStatus: { '!=': ['paid']} as any,
        paidDateTime: null,
      })
        // .populate('items&items.product')
        // .populate('items&items.optionValues&optionValues.option&optionValue')
        .populate(
          'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
        );
    }
    
    // let transactionsForOngoingOrders: TransactionType[] = [];
    // let transactionsForScheduledOrders: TransactionType[] = [];
    // let transactionsForPastOrders: TransactionType[] = [];
    // try {
    //   transactionsForOngoingOrders = await Transaction.find({
    //     order: _ongoingOrders.map((o) => o.id),
    //   }).populate('order&payer');
    //   transactionsForOngoingOrders = transactionsForOngoingOrders.filter(t => {
    //     return t.payer.walletAddress === inputs.walletId;
    //   });
    //   transactionsForScheduledOrders = await Transaction.find({
    //     order: _scheduledOrders.map((o) => o.id),
    //   }).populate('order&payer');
    //   transactionsForScheduledOrders = transactionsForScheduledOrders.filter(t => {
    //     return t.payer.walletAddress === inputs.walletId;
    //   });
    //   transactionsForPastOrders = await Transaction.find({
    //     order: _pastOrders.map((o) => o.id),
    //   }).populate('order&payer');
    //   transactionsForPastOrders = transactionsForPastOrders.filter(t => {
    //     return t.payer.walletAddress === inputs.walletId;
    //   });
    // } catch (error) {
    //   sails.log.error(
    //     `Unable to query db for transactions for get-orders helper. Error: ${error}`
    //   );
    // }

    // const ordersMap = async (orders: Array<OrderType>) => {
    //   let transactions: TransactionType[];
    //   try {
    //     transactions = await Transaction.find({
    //       order: orders.map((o) => o.id),
    //     }).populate('order&payer');
    //     transactions = transactions.filter(t => {
    //       return t.payer.walletAddress === inputs.walletId;
    //     });
    //   } catch (error) {
    //     sails.log.error(
    //       `Unable to query db for transactions for get-orders helper. Error: ${error}`
    //     );
    //   }
    //   return await Promise.all(orders.map(async (order) => {
    //     // let discounts = await Discount.find({
    //     //   id: order.discount.id,
    //     //   vendor: order.vendor.id,
    //     // });
    //     // if(!discounts || discounts.length < 1){
    //     //   discounts = await Discount.find({
    //     //     id: order.discount.id
    //     //   });
    //     // }
    //     // if(!discounts || discounts.length < 1){
    //     //   discounts = await Discount.find({
    //     //     code: order.discount.code
    //     //   });
    //     // }
    //     order.items = await Promise.all(order.items.map((orderItem) => {
    //       return async () => {
    //         const deepOrderItem = await OrderItem.findOne({id: orderItem.id}).populate('product&optionValues');
    //         return deepOrderItem;
    //       };
    //     }).map(p => p()));
        
    //     return {
    //       ...order,
    //       ...{
    //         items: order.items.map((orderItem) => {
    //           return {
    //             id: orderItem.id,
    //             unfulfilled: orderItem.unfulfilled,
    //             product: {
    //               name: orderItem.product.name,
    //               basePrice: orderItem.product.basePrice,
    //               options: orderItem.optionValues.map((optionValue) => {
    //                 return {
    //                   name: optionValue.option.name,
    //                   chosenOption: optionValue.optionValue.name,
    //                   priceModifier: optionValue.optionValue.priceModifier,
    //                 };
    //               }),
    //             },
    //           };
    //         }),
    //         deliveryPartner: order.deliveryPartner && {
    //           id: order.deliveryPartner.id,
    //           name: order.deliveryPartner.name,
    //         },
    //         vendor: {
    //           id: order.vendor.id,
    //           name: order.vendor.name,
    //         },
    //         fulfilmentMethod: {
    //           id: order.fulfilmentMethod.id,
    //           methodType: order.fulfilmentMethod.methodType,
    //           priceModifier: order.fulfilmentMethod.priceModifier,
    //         },
    //         // todo: gbpxUsed, didUsePPL, pplUsed, pplRewardsEarned, pplRewardsEarnedValue; // have methods to fetch transactions by checking both stripe and fuse explorer from one helper to then get transactions relating to a wallet address that we can then add to the orders list end points.
    //         // todo: We should also add a transactions table foreign keyeed to orders with a timestampe, currency, orderid, amount so that can have multi lines for one order detailing the different currencies.
    //         transactions: transactions.filter(t => t.order.id === order.id), 
    //         fulfilmentCharge: order.fulfilmentMethod.priceModifier, // is based on the vendors price modifier on the selected timeslot...
    //         platformFee: order.vendor.platformFee, // is fixed based on the fulfilment method...
    //       },
    //     };
    //   }));
    // };
    
    // const ongoingOrders = await ordersMap(_ongoingOrders);
    // const scheduledOrders = await ordersMap(_scheduledOrders);
    // const pastOrders = await ordersMap(_pastOrders);
    const ongoingOrders = await sails.helpers.formatOrders.with({
      orders:_ongoingOrders,
      walletId: inputs.walletId,
    });
    const scheduledOrders = await sails.helpers.formatOrders.with({
      orders:_scheduledOrders,
      walletId: inputs.walletId,
    });
    const pastOrders = await sails.helpers.formatOrders.with({
      orders:_pastOrders,
      walletId: inputs.walletId,
    });
    const unpaidOrders = await sails.helpers.formatOrders.with({
      orders:_unpaidOrders,
      walletId: inputs.walletId,
    });
    const allMyOrders = await sails.helpers.formatOrders.with({
      orders: _allMyOrders,
      walletId: inputs.walletId,
    });

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({
        ongoingOrders: ongoingOrders ? ongoingOrders.orders : [],
        scheduledOrders: scheduledOrders ? scheduledOrders.orders : [],
        pastOrders: pastOrders ? pastOrders.orders : [],
        unpaidOrders: unpaidOrders ? unpaidOrders.orders : [],
        allMyOrders: allMyOrders ? allMyOrders.orders : [],
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        ongoingOrders: ongoingOrders ? ongoingOrders.orders : [],
        scheduledOrders: scheduledOrders ? scheduledOrders.orders : [],
        pastOrders: pastOrders ? pastOrders.orders : [],
        unpaidOrders: unpaidOrders ? unpaidOrders.orders : [],
        allMyOrders: allMyOrders ? allMyOrders.orders : [],
        userRole: this.req.session.userRole,
      });
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
