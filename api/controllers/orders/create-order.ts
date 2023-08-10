import _ from 'lodash';
import util from 'util';
import moment from 'moment';

import { CreatePaymentIntentInternalResult } from '../../helpers/create-payment-intent-internal';
import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  OrderType,
  OrderItemType,
  AccountType,
  OrderItemOptionValueType,
  DiscountType
} from '../../../scripts/utils';
import { Currency } from '../../../api/interfaces/peeplPay';
import Stripe from 'stripe';

declare var sails: sailsVegi;
declare var OrderItemOptionValue: SailsModelType<OrderItemOptionValueType>;
declare var OrderItem: SailsModelType<OrderItemType>;
declare var Order: SailsModelType<OrderType>;
declare var Account: SailsModelType<AccountType>;

export const cleanPersonalDetails = <T extends {
  email?: string;
  name?: string;
  phoneNumber?: string;
}>(details: T):T => {
  return {
    ...details,
    email: details.email && details.email.trim().toLowerCase(),
    name: details.name && details.name.trim(),
    phoneNumber: details.phoneNumber && details.phoneNumber.trim(),
  };
};


export type CreateOrderInputs = {
  items: Array<{
    id: number;
    quantity: number;
    options: Array<{ [k: number]: number }>;
    optionValues?: Array<any>;
    order?: number | OrderType;
  }>;
  address: {
    lineOne: string;
    lineTwo?: string;
    city?: string;
    postCode: string;
    phoneNumber?: string;
    email?: string;
    name: string;
    deliveryInstructions?: string;
    lat?: undefined | number;
    lng?: undefined | number;
  };
  firebaseRegistrationToken: string;
  total: number;
  currency: Currency;
  marketingOptIn: boolean;
  discountCodes: string[];
  vendor: number;
  fulfilmentMethod: number;
  fulfilmentSlotFrom: string;
  fulfilmentSlotTo: string;
  tipAmount: number;
  walletAddress: string;
};

export type ValidateOrderResult = {
  orderInputs: CreateOrderInputs;
  orderIsValid: boolean;
};


type CreateOrderResult =
  | {
      orderId: null;
      orderCreationStatus: 'failed';
      order: null;
      stripePaymentIntent: false;
      error: Error;
      // paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
      // ephemeralKey: string;
      // customer: string;
      // publishableKey: string;
    }
  | {
      orderId: number;
      orderCreationStatus: 'confirmed' | 'failed';
      order: OrderType;
      stripePaymentIntent: CreatePaymentIntentInternalResult;
      // paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
      // ephemeralKey: string;
      // customer: string;
      // publishableKey: string;
    };

export type CreateOrderResponse = CreateOrderResult;

export type CreateOrderExits = {
  success: (unusedData: CreateOrderResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
  invalidSlot: (unusedErr: Error | String) => void;
  deliveryPartnerUnavailable: (unusedErr: Error | String) => void;
  allItemsUnavailable: (unusedErr: Error | String) => void;
  minimumOrderAmount: (unusedErr: Error | String) => void;
  noItemsFound: (unusedErr: Error | String) => void;
  badItemsRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  CreateOrderInputs,
  CreateOrderResponse,
  CreateOrderExits
> = {
  friendlyName: 'Create order',

  description: 'This action is responsible for the creation of new orders.',

  inputs: {
    items: {
      type: 'ref',
      description:
        'Cart items from the frontend, which include the product id and corresponding options.',
      required: true,
    },
    address: {
      type: 'ref',
      description: "The user's address.",
      required: true,
    },
    firebaseRegistrationToken: {
      type: 'string',
      description: 'token used for firebase notifications',
      required: false,
    },
    total: {
      type: 'number',
      description: 'The total order value, including shipping.',
      required: true,
    },
    currency: {
      type: 'string',
      description: 'The currency for the total amount',
      required: true,
      isIn: [
        Currency.EUR,
        Currency.GBP,
        Currency.GBPx,
        Currency.GBT,
        Currency.PPL,
        Currency.USD,
      ],
    },
    marketingOptIn: {
      type: 'boolean',
    },
    discountCodes: {
      type: 'ref',
      required: false,
      defaultsTo: [],
    },
    vendor: {
      type: 'number',
      required: true,
    },
    fulfilmentMethod: {
      type: 'number',
      required: true,
    },
    fulfilmentSlotFrom: {
      type: 'string',
      description:
        'Delivery after this time if delivery, collection from vendor after this time if collection',
      required: true,
    },
    fulfilmentSlotTo: {
      type: 'string',
      description:
        'Delivery before this time if delivery, collection from vendor before this time if collection',
      required: true,
    },
    tipAmount: {
      type: 'number',
      defaultsTo: 0,
    },
    walletAddress: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidSlot: {
      statusCode: 422,
      description: 'The fulfilment slot is invalid.',
    },
    deliveryPartnerUnavailable: {
      statusCode: 422,
      description: 'No deliveryPartner available.',
    },
    allItemsUnavailable: {
      statusCode: 422,
      description: 'All items are unavailable from merchant.',
    },
    minimumOrderAmount: {
      statusCode: 400,
      description: 'The minimum order amount was not met.',
    },
    noItemsFound: {
      statusCode: 400,
    },
    badItemsRequest: {
      responseType: 'badRequest',
      statusCode: 400,
    },
    notFound: {
      statusCode: 404,
      responseType: 'notFound',
    },
    badRequest: {
      responseType: 'badRequest',
      statusCode: 400,
    },
    success: {
      data: false,
    },
    issue: {
      statusCode: 403,
    },
    error: {
      statusCode: 500,
    },
  },

  fn: async function (inputs: CreateOrderInputs, exits: CreateOrderExits) {
    try {
      const cleanAddress = cleanPersonalDetails(inputs.address);
      inputs.address = cleanAddress;
      const validateOrderResult = await sails.helpers.validateOrder.with(
        inputs
      );
      if (validateOrderResult.orderIsValid) {
        inputs = validateOrderResult.orderInputs;
      } else {
        return exits.badRequest(`Order invalid`);
      }
    } catch (err) {
      sails.log(err);
      return exits.badRequest(err);
    }

    let vendor = await Vendor.findOne({ id: inputs.vendor })
      .populate('deliveryPartner')
      .populate('pickupAddress');
    let discounts: sailsModelKVP<DiscountType>[] = [];

    if (inputs.discountCodes && inputs.discountCodes.length > 0) {
      if (inputs.vendor) {
        discounts = await Discount.find({
          code: inputs.discountCodes,
          vendor: inputs.vendor,
        });
      } else {
        discounts = await Discount.find({ code: inputs.discountCodes });
      }
      var currentTime = new Date().getTime();
      discounts = discounts.filter(
        (d) =>
          d.timesUsed < d.maxUses &&
          moment.utc(d.expiryDateTime).isSameOrAfter(moment.utc()) &&
          d.isEnabled
      );
    }

    sails.log.verbose(`Create-order found ${discounts.length} discount objects from ${inputs.discountCodes.length} input codes.`);

    const fulfilmentMethod = await FulfilmentMethod.findOne(
      inputs.fulfilmentMethod
    ).populate('vendor&deliveryPartner');
    if (fulfilmentMethod.vendor && fulfilmentMethod.vendor.id) {
      if (fulfilmentMethod.vendor.id !== inputs.vendor) {
        return exits.badRequest(
          'Vendor did not match the vendor on the requested fulfilment method'
        );
      }
    } else if (
      fulfilmentMethod.deliveryPartner &&
      fulfilmentMethod.deliveryPartner.id
    ) {
      if (
        vendor.deliveryPartner &&
        fulfilmentMethod.deliveryPartner.id !== vendor.deliveryPartner.id
      ) {
        return exits.badRequest(
          "DeliveryPartner of the fulfilment method did not match vendor's CHOSEN DeliveryPartner. No other DP should be used."
        );
      }
      // ! Ignore as we want to allow a deliverypartner from the pool to service this request.
      // if (!vendor.deliveryPartner) {
      //   return exits.badRequest(
      //     'No deliverypartner exists on the requested vendor for the requested fulfilment method'
      //   );
      // } else if (
      //   fulfilmentMethod.deliveryPartner.id !== vendor.deliveryPartner.id
      // ) {
      //   return exits.badRequest(
      //     'DeliveryPartner of the fulfilment method did not match vendors DeliveryPartner.'
      //   );
      // }
    }

    // const isDelivery = fulfilmentMethod.methodType === 'delivery';

    let availableDeliveryPartner = null;
    //! Removed available deliveryPartners from pool as inputs.fulfilmentMethod will specify the dp fm id which it receives in the get-fulfilment-slots get call in slots[i].fulfilmentMethod
    //TODO: This option to use the rest of the pull needs to be added to the get-fulfilment-slots call
    // if (isDelivery) {
    //   try {
    //     availableDeliveryPartner =
    //       await sails.helpers.getAvailableDeliveryPartnerFromPool.with({
    //         fulfilmentSlotFrom: inputs.fulfilmentSlotFrom, //moment.utc("01:15:00 PM", "h:mm:ss A")
    //         fulfilmentSlotTo: inputs.fulfilmentSlotTo, //moment.utc("01:15:00 PM", "h:mm:ss A")

    //         pickupFromVendor: vendor.id,

    //         deliveryContactName: inputs.address.name,
    //         deliveryPhoneNumber: inputs.address.phoneNumber,
    //         deliveryComments: inputs.address.deliveryInstructions,

    //         deliveryAddressLineOne: inputs.address.lineOne,
    //         deliveryAddressLineTwo: inputs.address.lineTwo,
    //         deliveryAddressCity: inputs.address.city,
    //         deliveryAddressPostCode: inputs.address.postCode,
    //       });
    //   } catch (error) {
    //     sails.log.error(
    //       `helpers.getAvailableDeliveryPartnerFromPool errored: ${error}`
    //     );
    //     availableDeliveryPartner = null;
    //   }

    //   if (!availableDeliveryPartner) {
    //     //todo: allow order if the vendor can service the delivery.

    //     return exits.invalidSlot(
    //       'Neither vendor nor any deliveryPartner from the pool is available for requested delivery fulfilment'
    //     );
    //   }
    // } else {
    //   availableDeliveryPartner = null;
    // }

    // ! Merchant fulfilment check done by merchant after receiveing the SMS and they click the link /orders/peepl-pay-webhook which itself is a callback from /helpers/create-payment-intent
    let result: CreateOrderResult;
    try {
      const datastore = sails.getDatastore();

      const wrapWithDb = (db, cb) => {
        try {
          if (db) {
            return cb().usingConnection(db);
          } else {
            return cb();
          }
        } catch (error) {
          sails.log.error(
            `orders/create-order threw updating the db with the child order clone: ${error}`
          );
        }
      };

      let newPaymentIntent: CreatePaymentIntentInternalResult;
      let order: OrderType;

      // type CreateOrderTransactionFuncType = Promise<| {
      //         orderId: any;
      //         paymentIntentID: any;
      //         orderCreationStatus: 'failed';
      //         // calculatedOrderTotal?: undefined;
      //     } | {
      //   orderId: number | null;
      //   paymentIntentID: string | null;
      //   orderCreationStatus: CreateOrderResult['orderCreationStatus'];
      //   calculatedOrderTotal:
      //     | 
      //     {
      //         finalAmount: number;
      //         withoutFees: number;
      //         currency: Currency;
      //       };
      // }>;

      const createOrderTransactionDB: (db: any) => Promise<
        | {
            orderId: null;
            // paymentIntentID: null;
            orderCreationStatus: 'failed';
            calculatedOrderTotal: null;
            error: Error;
          }
        | {
            orderId: number;
            // paymentIntentID: string;
            orderCreationStatus: 'confirmed';
            calculatedOrderTotal: {
              finalAmount: number;
              withoutFees: number;
              currency: Currency;
            };
          }
      > = async (db: any) => {
        for (var item in inputs.items) {
          var orderItemOptionValues = [];
          for (var option in inputs.items[item].options) {
            // options is a dictionary of <string, int> where the int is the selectedProductOptions.id
            if (Object.keys(inputs.items[item]).includes('quantity')) {
              orderItemOptionValues.push(
                ...Array(inputs.items[item].quantity).fill({
                  option: option,
                  optionValue: inputs.items[item].options[option],
                })
              );
            } else {
              orderItemOptionValues.push({
                option: option,
                optionValue: inputs.items[item].options[option],
              });
            }
          }
          var newOrderItemOptionValues = [];
          try {
            const dbPromises = orderItemOptionValues.map((o) =>
              wrapWithDb(db, () => OrderItemOptionValue.create(o)).fetch()
            );
            newOrderItemOptionValues = await Promise.all(dbPromises);
          } catch (err) {
            sails.log.error(`${err}`);
            // exits.badItemsRequest();
            return {
              orderId: null,
              // paymentIntentID: null,
              orderCreationStatus:
                'failed',
              calculatedOrderTotal: null,
              error: err,
            };
          }

          // Get array of IDs from array of newOrderItemOptionValues
          inputs.items[item].optionValues = newOrderItemOptionValues.map(
            ({ id: number }) => number
          );
        }
        let orderTotal = inputs.total;
        let tipAmountPence = 0;
        try {
          tipAmountPence = await sails.helpers.convertCurrencyAmount.with({
            amount: inputs.tipAmount,
            // fromCurrency: inputs.currency,
            fromCurrency: Currency.GBPx,
            toCurrency: Currency.GBPx,
          });
        } catch (error) {
          sails.log.error(
            `Error trying to convert tip amount to GBPx: ${error}`
          );
        }
        try {
          if (inputs.currency !== Currency.GBP) {
            orderTotal = await sails.helpers.convertCurrencyAmount.with({
              amount: inputs.total,
              fromCurrency: inputs.currency,
              toCurrency: Currency.GBP,
            });
          }
        } catch (error) {
          sails.log.error(
            `Error trying to convert order total to GBPx: ${error}`
          );
          return {
            orderId: null,
            // paymentIntentID: null,
            orderCreationStatus:
              'failed',
            calculatedOrderTotal: null,
            error: new Error(`Error trying to convert order total to GBPx: ${error}`),
          };
        }

        try {
          order = await wrapWithDb(db, () =>
            Order.create({
              total: orderTotal,
              currency: inputs.currency || Currency.GBPx,
              firebaseRegistrationToken: inputs.firebaseRegistrationToken,
              orderedDateTime: Date.now(),
              deliveryAccepted: !!availableDeliveryPartner,
              deliveryPartner: availableDeliveryPartner
                ? availableDeliveryPartner.id
                : null,
              deliveryName: inputs.address.name,
              deliveryEmail: inputs.address.email,
              deliveryPhoneNumber: inputs.address.phoneNumber,
              deliveryAddressLineOne: inputs.address.lineOne,
              deliveryAddressLineTwo: inputs.address.lineTwo,
              deliveryAddressCity: inputs.address.city,
              deliveryAddressPostCode:
                inputs.address.postCode ||
                vendor.pickupAddress.postCode ||
                'NA11 1AA',
              deliveryAddressLatitude: inputs.address.lat,
              deliveryAddressLongitude: inputs.address.lng,
              deliveryAddressInstructions: inputs.address.deliveryInstructions,
              customerWalletAddress: inputs.walletAddress,
              // discount: discounts ? discounts.id : undefined,
              vendor: vendor.id,
              fulfilmentMethod: inputs.fulfilmentMethod,
              fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
              fulfilmentSlotTo: inputs.fulfilmentSlotTo,
              tipAmount: tipAmountPence,
            })
          ).fetch();
          await wrapWithDb(db, () =>
            Order.addToCollection(order.id, 'discounts').members(
              discounts.map((discount) => discount.id)
            )
          );
        } catch (error) {
          sails.log.error(`Error on Order.create(...) -> ${error}`);
          // exits.error(error);
          return {
            orderId: null,
            // paymentIntentID: null,
            orderCreationStatus:
              'failed',
            calculatedOrderTotal: null,
            error: error,
          };
        }

        // Strip unneccesary data from order items
        var updatedItems = _.flatten(
          _.map(inputs.items, (object) => {
            return Object.keys(object).includes('quantity')
              ? Array(object.quantity).fill({
                  order: order.id,
                  product: object.id,
                  optionValues: object.optionValues,
                })
              : [
                  {
                    order: order.id,
                    product: object.id,
                    optionValues: object.optionValues,
                  },
                ];
          })
        );

        // Create each order item
        const dbPromises = updatedItems.map(
          (o) => wrapWithDb(db, () => OrderItem.create(o)) //.fetch()
        );
        await Promise.all(dbPromises);

        // Calculate the order total on the backend
        var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with(
          {
            orderId: order.id,
            inCurrency: order.currency,
          }
        );

        // If frontend total is incorrect
        if (order.total !== calculatedOrderTotal.finalAmount) {
          sails.log.warn(`Order total mismatch`);
          sails.log.warn(
            `Order total is [${order.currency}] ${order.total} but is calculated to be total ${calculatedOrderTotal.finalAmount} ${calculatedOrderTotal.finalAmount}`
          );

          if (calculatedOrderTotal.withoutFees <= 0) {
            sails.log.warn(
              `New Order #${order.id} has a ${calculatedOrderTotal.withoutFees} subtotal with a total of ${calculatedOrderTotal.finalAmount}`
            );
            // exits.error(`Could not calculate subtotal for order.`);
            return {
              orderId: null,
              // paymentIntentID: null,
              orderCreationStatus:
                'failed',
              calculatedOrderTotal: null,
              error: new Error(`New Order #${order.id} has a ${calculatedOrderTotal.withoutFees} subtotal with a total of ${calculatedOrderTotal.finalAmount}`),
            };
          }
        } else {
          sails.log.verbose(
            `Order totals are matching:[${calculatedOrderTotal.currency}] ${calculatedOrderTotal.finalAmount}`
          );
        }
        // Update with correct amount
        await wrapWithDb(db, () =>
          Order.updateOne(order.id).set({
            subtotal: calculatedOrderTotal.withoutFees,
            total: calculatedOrderTotal.finalAmount,
            currency: calculatedOrderTotal.currency,
          })
        );

        // Return error if vendor minimum order value not met
        let calculatedOrderTotalWithoutFeesGBPx =
          calculatedOrderTotal.withoutFees;
        if (calculatedOrderTotal.currency !== Currency.GBPx) {
          calculatedOrderTotalWithoutFeesGBPx =
            await sails.helpers.convertCurrencyAmount.with({
              amount: calculatedOrderTotal.withoutFees,
              fromCurrency: calculatedOrderTotal.currency,
              toCurrency: Currency.GBPx,
            });
        }
        if (calculatedOrderTotalWithoutFeesGBPx < vendor.minimumOrderAmount) {
          sails.log.info('Vendor minimum order value not met');
          // exits.minimumOrderAmount('Vendor minimum order value not met');
          return {
            orderId: null,
            // paymentIntentID: null,
            orderCreationStatus: 'failed',
            calculatedOrderTotal: null,
            error: new Error('Vendor minimum order value not met'),
          };
        }

        // All done.
        return {
          orderId: order.id,
          // paymentIntentID: paymentIntentId,
          // paymentIntentID: null,
          orderCreationStatus:
            'confirmed',
          calculatedOrderTotal: calculatedOrderTotal,
        };
      };

      // const sendSMSOrder = async (result: {
      //   orderId: any;
      //   paymentIntentID: any;
      //   orderCreationStatus: string;
      // }) => {
      //   try {
      //     await sails.helpers.sendSmsNotification.with({
      //       to: inputs.address.phoneNumber,
      //       body: `Order accepted! Details of your order can be found in the My Orders section of the vegi app. Thank you!`,
      //       data: {
      //         orderId: result.orderId,
      //       },
      //     });
      //   } catch (error) {
      //     sails.log.error(
      //       `peepl-pay-webhook errored sending sms notification to vendor for paid order: ${error}`
      //     );
      //   }
      // };
      let result: Awaited<ReturnType<typeof createOrderTransactionDB>>;
      if (datastore.config.adapter === 'sails-disk') {
        result = await createOrderTransactionDB(null);
        if (
          process.env.NODE_ENV &&
          !process.env.NODE_ENV.toLowerCase().startsWith('prod')
        ) {
          sails.log('USING sails-disk');
          sails.log(
            `create-order -> order created -> ${util.inspect(result, {
              depth: 0,
            })}`
          );
        }
      } else {
        await sails
          .getDatastore()
          .transaction(async (db) => {
            result = await createOrderTransactionDB(db);
          })
          .intercept((issues) => {
            sails.log(issues);
            return exits.error(new Error('Error creating Order in DB'));
          });
        if (
          process.env.NODE_ENV &&
          !process.env.NODE_ENV.toLowerCase().startsWith('prod')
        ) {
          sails.log.verbose(
            `create-order -> order created -> ${util.inspect(result, {
              depth: 0,
            })}`
          );
        }
      }

      // Create PaymentIntent on Peepl Pay
      let account: sailsModelKVP<AccountType> | null = null;
      try {
        const accounts = await Account.find({
          walletAddress: inputs.walletAddress,
        });
        if (accounts.length < 1) {
          sails.log.error(
            `Unable to locate account for wallet address used to create-order of "${inputs.walletAddress}"`
          );
        } else {
          account = accounts[0];
        }
      } catch (error) {
        sails.log.error(
          `Unable to locate account for wallet address used to create-order of "${inputs.walletAddress}": ${error}`
        );
      }

      if(result.orderCreationStatus === 'failed'){
        sails.log.error(
          `Failed to create order in db with error: ${result.error}`
        );
        return exits.success({
          orderId: null,
          orderCreationStatus: 'failed',
          order: null,
          stripePaymentIntent: false,
          error: new Error(`Failed to create order in db with error: ${result.error}`),
          // paymentIntent: null,
          // ephemeralKey: null,
          // customer: null,
          // publishableKey: null,
        });
      }


      let finalAmount = result.calculatedOrderTotal.finalAmount;
      let finalAmountCurrency = order.currency;
      if (order.currency !== result.calculatedOrderTotal.currency){
        finalAmountCurrency = order.currency || Currency.GBP;
        finalAmount = await sails.helpers.convertCurrencyAmount.with({
          amount: result.calculatedOrderTotal.finalAmount,
          fromCurrency: result.calculatedOrderTotal.currency,
          toCurrency: finalAmountCurrency,
        });
      }
      
      let failureReason;
      try {
        if(!account){
          sails.log.warn(
            `Failed to create paymentIntent for new order with vegiAccount as cant locate a vegiAccount with {walletAddress: "${inputs.walletAddress}"}`
          );
        }
        const _newPaymentIntent =
          await sails.helpers.createPaymentIntentInternal.with({
            amount: finalAmount,
            currency: finalAmountCurrency,
            recipientWalletAddress: vendor.walletAddress,
            vendorDisplayName: vendor.name,
            webhookAddress: sails.config.custom.peeplWebhookAddress,
            customerId: account && account.stripeCustomerId || '',
            userId: this.req.session.userId,
            senderWalletAddress: inputs.walletAddress,
            accountId: account && account.id,
            orderId: order.id,
            receiptEmail: order.deliveryEmail,
          });
        newPaymentIntent = _newPaymentIntent;
      } catch (error) {
        failureReason = `${error}`;
        sails.log.error(
          `Failed to create payment intent on helper "createPaymentIntentInternal" with reason: "${failureReason}"`
        );
      }

      if (failureReason) {
        const err = new Error(`Error creating payment intent: "${failureReason}"`);
        sails.log.error(
          err
        );
        return exits.success({
          orderId: null,
          orderCreationStatus: 'failed',
          order: null,
          stripePaymentIntent: false,
          error: err,
          // paymentIntent: null,
          // ephemeralKey: null,
          // customer: null,
          // publishableKey: null,
        });
      }

      if (newPaymentIntent.success === false) {
        const err = newPaymentIntent.error;
        sails.log.error(`${newPaymentIntent.message}`);
        return exits.success({
          orderId: null,
          orderCreationStatus: 'failed',
          order: null,
          stripePaymentIntent: false,
          error: err,
          // paymentIntent: null,
          // ephemeralKey: null,
          // customer: null,
          // publishableKey: null,
        });
      }
      const paymentIntentId = newPaymentIntent.paymentIntent.id;
      sails.log(
        `Update order[${order.id}] with publicId: "${order.publicId}" and set paymentIntentId: "${paymentIntentId}" from stripe`
      );

      try {
        await Order.updateOne(order.id).set({
          paymentIntentId: paymentIntentId,
        });
      } catch (error) {
        sails.log.error(`${error}`);
      }

      const _newOrder = await Order.findOne(result.orderId).populate(
        'fulfilmentMethod&discount&deliveryPartner&vendor&items&items.product'
      );

      const formattedOrders = await sails.helpers.formatOrders.with({
        orders: [_newOrder],
      });

      const newOrder = formattedOrders && formattedOrders.orders[0];

      return exits.success({
        orderId: result.orderId,
        orderCreationStatus: result.orderCreationStatus,
        order: newOrder,
        stripePaymentIntent: newPaymentIntent,
      });
    } catch (error) {
      sails.log.error(`${error}`);
      try {
        await sails.helpers.sendSmsNotification.with({
          to: inputs.address.phoneNumber,
          body: `We're sorry but your order has been declined.
For help please contact support@vegiapp.co.uk`,
          data: {
            orderId: null,
          },
        });
      } catch (error) {
        sails.log.error(
          `peepl-pay-webhook errored sending sms notification to vendor for errored order: ${error}`
        );
      }
      return exits.error(new Error('Error creating Order in DB'));
    }
    // return exits.success(result);
  },
};

module.exports = _exports;
