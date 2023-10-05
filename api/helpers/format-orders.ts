import {
  DiscountType,
  OrderItemType,
  SailsActionDefnType,
  TransactionType,
  walletAddressString,
} from '../../scripts/utils';
import { SailsModelType, sailsVegi } from '../interfaces/iSails';
import { OrderType } from '../../scripts/utils';

declare var sails: sailsVegi;
declare var OrderItem: SailsModelType<OrderItemType>;
declare var Transaction: SailsModelType<TransactionType>;

const isInt = (obj:object|number|null) => {
  if(!obj && obj !== 0){
    return false;
  } else if(Number.isInteger(obj)){
    return true;
  }
  return false;
};

export type FormatOrdersInputs = {
  orders: OrderType[];
  walletId?: walletAddressString | undefined | '' | null;
};

export type FormattedOrderForClients =
  | {
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
      transactions: TransactionType[];
      fulfilmentCharge: number;
      platformFee: number;
      unfulfilledItems:
        | {
            id: number;
            methodType: 'delivery' | 'collection';
            priceModifier: number;
          }
        | any;
    }[]
  | any;

export type FormatOrdersResult =
  | {
      orders: Array<FormattedOrderForClients>;
    }
  | false;

export type FormatOrdersExits = {
  success: (unusedData: FormatOrdersResult) => any;
};

const _exports: SailsActionDefnType<
  FormatOrdersInputs,
  FormatOrdersResult,
  FormatOrdersExits
> = {
  friendlyName: 'FormatOrders',

  inputs: {
    orders: {
      type: 'ref',
      required: true,
    },
    walletId: {
      type: 'string',
      required: false,
    },
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (inputs: FormatOrdersInputs, exits: FormatOrdersExits) {
    let orders = inputs.orders;
    let transactions: TransactionType[] = [];
    try {
      transactions = await Transaction.find({
        order: orders.map((o) => o.id),
      }).populate('order&payer');
      if (inputs.walletId) {
        transactions = transactions.filter((t) => {
          return t.payer.walletAddress === inputs.walletId;
        });
      }
    } catch (error) {
      sails.log.error(
        `Unable to query db for transactions for format-orders helper. Error: ${error}`
      );
    }
    
    try {
      const firstOrder = orders && orders.length > 0 && orders[0];
      if(isInt(firstOrder.fulfilmentMethod) || isInt(firstOrder.vendor) || isInt(firstOrder.deliveryPartner) || (firstOrder.items && firstOrder.items.length > 0 && isInt(firstOrder.items[0].product))){
        orders = await Order.find({
          id: orders.map(o => o.id)
        })
          // .populate('items&items.product')
          // .populate('items&items.optionValues&optionValues.option&optionValue')
          .populate(
            'fulfilmentMethod&deliveryPartner&vendor&items&items.product'
          );
      }
    } catch (error) {
      sails.log.error(
        `Unable to query db for orders for format-orders helper. Error: ${error}`
      );
    }
    const newOrders = await Promise.all(
      orders.map(async (order) => {
        // let discounts = await Discount.find({
        //   id: order.discount.id,
        //   vendor: order.vendor.id,
        // });
        // if(!discounts || discounts.length < 1){
        //   discounts = await Discount.find({
        //     id: order.discount.id
        //   });
        // }
        // if(!discounts || discounts.length < 1){
        //   discounts = await Discount.find({
        //     code: order.discount.code
        //   });
        // }
        order.items = await Promise.all(
          order.items
            .map((orderItem) => {
              return async () => {
                const deepOrderItem = await OrderItem.findOne({
                  id: orderItem.id,
                }).populate('product&optionValues');
                return deepOrderItem;
              };
            })
            .map((p) => p())
        );

        return {
          ...order,
          ...{
            items: order.items.map((orderItem) => {
              if(!orderItem.product){
                sails.log.info(`No product found on orderItem[${orderItem.id}] for order[${order.id}]`);
                sails.log.info(JSON.stringify(orderItem,null,4));
                return false;
              }
              return {
                id: orderItem.id,
                unfulfilled: orderItem.unfulfilled,
                product: isInt(orderItem.product) ? orderItem.product : orderItem.product && {
                  id: orderItem.product.id,
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
            }).filter((orderItem) => (orderItem !== false)),
            deliveryPartner: isInt(order.deliveryPartner) ? order.deliveryPartner : order.deliveryPartner,
            vendor: isInt(order.vendor) ? order.vendor : order.vendor,
            fulfilmentMethod: isInt(order.fulfilmentMethod) ? order.fulfilmentMethod : order.fulfilmentMethod && {
              id: order.fulfilmentMethod.id,
              methodType: order.fulfilmentMethod.methodType,
              priceModifier: order.fulfilmentMethod.priceModifier,
            },
            // todo: gbpxUsed, didUsePPL, pplUsed, pplRewardsEarned, pplRewardsEarnedValue; // have methods to fetch transactions by checking both stripe and fuse explorer from one helper to then get transactions relating to a wallet address that we can then add to the orders list end points.
            // todo: We should also add a transactions table foreign keyeed to orders with a timestampe, currency, orderid, amount so that can have multi lines for one order detailing the different currencies.
            transactions: transactions.filter((t) => t.order.id === order.id),
            fulfilmentCharge: order.fulfilmentMethod.priceModifier, // is based on the vendors price modifier on the selected timeslot...
            platformFee: order.vendor.platformFee, // is fixed based on the fulfilment method...
          },
        };
      })
    );
    return exits.success({
      orders: newOrders,
    });
  },
};

module.exports = _exports;
