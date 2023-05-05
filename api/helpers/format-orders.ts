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
      cartDiscountCode: string;
      cartDiscountType: DiscountType['discountType'];
      cartDiscountAmount: number;
      cartTip: number;
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
      if(isInt(firstOrder.fulfilmentMethod) || isInt(firstOrder.vendor) || isInt(firstOrder.deliveryPartner)){
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
            // todo: gbpxUsed, didUsePPL, pplUsed, pplRewardsEarned, pplRewardsEarnedValue; // have methods to fetch transactions by checking both stripe and fuse explorer from one helper to then get transactions relating to a wallet address that we can then add to the orders list end points.
            // todo: We should also add a transactions table foreign keyeed to orders with a timestampe, currency, orderid, amount so that can have multi lines for one order detailing the different currencies.
            transactions: transactions.filter((t) => t.order.id === order.id),
            fulfilmentCharge: order.fulfilmentMethod.priceModifier, // is based on the vendors price modifier on the selected timeslot...
            platformFee: order.vendor.platformFee, // is fixed based on the fulfilment method...
            cartDiscountCode: order.discount && order.discount.code, // where can we find the discount code that was applied to this order...
            cartDiscountType: order.discount
              ? order.discount.discountType
              : 'fixed', // where can we find the discount code that was applied to this order...
            cartDiscountAmount: order.discount ? order.discount.value : 0, // where can we find the discount code that was applied to this order...
            // cartDiscountType: discounts && discounts.length > 0 ? discounts[0].discountType : '', // where can we find the discount code that was applied to this order...
            // cartDiscountAmount: discounts && discounts.length > 0 ? discounts[0].value : 0, // where can we find the discount code that was applied to this order...
            cartTip: order.tipAmount,
            //TODO: IF no transactions, append an empty transaction to assume all GBP or actually, just do this in UI and ignore for backend as the transaction does not exist...
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
