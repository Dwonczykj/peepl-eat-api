import { DiscountType, OrderAcceptedStatusType, OrderItemType, SailsActionDefnType, TimePeriodEnumType, TransactionType } from '../../scripts/utils';
import {
  sailsModelKVP as SailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../interfaces/iSails';
import {
  OrderType
} from '../../scripts/utils';

declare var sails: sailsVegi;
declare var Order: SailsModelType<OrderType>;
declare var OrderItem: SailsModelType<OrderItemType>;
declare var Transaction: SailsModelType<TransactionType>;


export type GetOrdersInputs = {
  acceptanceStatus: OrderAcceptedStatusType,
  timePeriod: TimePeriodEnumType,
  customerWalletAddress?: string | null,
};

export type GetOrdersResult =
  | (OrderType & {
      transactions: SailsModelKVP<TransactionType>[];
      fulfilmentCharge: number;
      platformFee: number;
      cartDiscountCode: string;
      cartDiscountType: DiscountType['discountType'];
      cartDiscountAmount: number;
    })[]
  | false;

export type GetOrdersExits = {
  success: (unusedData: GetOrdersResult) => any;
};

const _exports: SailsActionDefnType<
  GetOrdersInputs,
  GetOrdersResult,
  GetOrdersExits
> = {
  friendlyName: 'GetOrders',

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
    },
    customerWalletAddress: {
      type: 'string',
      required: false,
    },
    
  },

  exits: {
    success: {
      data: false,
    },
  },

  fn: async function (
    inputs: GetOrdersInputs,
    exits: GetOrdersExits
  ) {
    let criteria = {
      paidDateTime: {'>': 0},
      restaurantAcceptanceStatus: undefined,
      vendor: undefined,
      fulfilmentSlotFrom: undefined,
      fulfilmentSlotTo: undefined,
      completedFlag: undefined,
      customerWalletAddress: undefined,
    };

    // Sort by fulfilment time ascending
    let sort = 'fulfilmentSlotFrom ASC';

    
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
    if(inputs.customerWalletAddress) {
      criteria.customerWalletAddress = inputs.customerWalletAddress;
    }
    let orderDetails: OrderType[];
    try {
      orderDetails = await Order.find(criteria)
        .sort(sort)
        .populate(
          'fulfilmentMethod&discount&deliveryPartner&vendor&items&items.product'
        );
      // const ordersWithItemProducts = await Order.find(criteria)
      //   .sort(sort)
      //   .populate('items&items.product');
      // const ordersWithItemOptVals = await Order.find(criteria)
      //   .sort(sort)
      //   .populate('items&items.optionValues&optionValues.option&optionValue');
      // const orders = orderDetails.map(o => {
      //   o['items'] = ordersWithItemProducts.map(op => {
      //     op['']
      //   })

      //   return o;
      // })
    } catch (error) {
      sails.log.error(error);
    }

    try {
      const transactions = await Transaction.find({
        order: orderDetails.map(o => o.id)
      });

      const promises = orderDetails.map((order) => {
        return async () => {
          let discounts: SailsModelKVP<DiscountType>[] = [];
          if(order.discount){
            discounts = await Discount.find({
              id: order.discount.id,
              vendor: order.vendor.id,
            });
            if(!discounts || discounts.length < 1){
              discounts = await Discount.find({
                id: order.discount.id
              });
            }
            if(!discounts || discounts.length < 1){
              discounts = await Discount.find({
                code: order.discount.code
              });
            }
          }
          
          order.items = await Promise.all(order.items.map((orderItem) => {
            return async () => {
              const deepOrderItem = await OrderItem.findOne({id: orderItem.id}).populate('product&optionValues');
              if(orderItem.product && !deepOrderItem){
                sails.log.warn(`Deprecated product id: [${orderItem.product}] stored against order in DB`);
              }
              return deepOrderItem;
            };
          }).map(p => p()));
          
          return {
            ...order,
            transactions: transactions.filter((t) => t.order === order.id),
            fulfilmentCharge: order.fulfilmentMethod.priceModifier, // is based on the vendors price modifier on the selected timeslot...
            platformFee: order.vendor.platformFee, // is fixed based on the fulfilment method...
            cartDiscountCode: order.discount && order.discount.code, // where can we find the discount code that was applied to this order...
            cartDiscountType: order.discount ? order.discount.discountType : 'fixed', // where can we find the discount code that was applied to this order...
            cartDiscountAmount: order.discount ? order.discount.value : 0, // where can we find the discount code that was applied to this order...
          };
        };
      }).map(p => p());
      // const x = await promises[0]();
      const orders = await Promise.all(promises);
      
      return exits.success(orders);
    } catch (error) {
      sails.log.error(`Unable to query db for transactions for get-orders helper. Error: ${error}`);
    }

    return exits.success(false);
  },
};

module.exports = _exports;
