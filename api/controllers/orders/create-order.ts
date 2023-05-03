import _ from 'lodash';
import { AccountType, OrderItemOptionValueType, OrderItemType, OrderType } from '../../../scripts/utils';
import util from 'util';
import { SailsModelType, sailsModelKVP, sailsVegi } from '../../../api/interfaces/iSails';
import { CreatePaymentIntentInternalResult } from '../../../api/helpers/create-payment-intent-internal';

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
  marketingOptIn: boolean;
  discountCode: string;
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


export type CreateOrderResult = {
  orderId: number;
  paymentIntentID: string;
  orderCreationStatus: string;
}

module.exports = {
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
    marketingOptIn: {
      type: 'boolean',
    },
    discountCode: {
      type: 'string',
      required: false,
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
      responseType: 'noItemsFound',
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
    error: {
      statusCode: 400,
    },
  },

  fn: async function (
    inputs: CreateOrderInputs,
    exits: {
      success: (unusedResult: CreateOrderResult) => CreateOrderResult;
      invalidSlot: (unusedArg?: string | Error) => void;
      deliveryPartnerUnavailable: (unusedErr: Error) => void;
      allItemsUnavailable: (unusedArg?: string | Error) => void;
      minimumOrderAmount: (unusedArg?: string | Error) => void;
      noItemsFound: (unusedArg?: string | Error) => void;
      badItemsRequest: (unusedArg?: string | Error) => void;
      notFound: (unusedArg?: string | Error) => void;
      badRequest: (unusedArg?: string | Error) => void;
      error: (unusedArg?: string | Error) => void;
    }
  ) {
    try {
      const cleanAddress = cleanPersonalDetails(inputs.address);
      inputs.address = cleanAddress;
      const validateOrderResult = await sails.helpers.validateOrder.with(inputs);
      if(validateOrderResult.orderIsValid){
        inputs = validateOrderResult.orderInputs;
      } else {
        return exits.badRequest(`Order invalid`);
      }
    } catch (err) {
      return exits.badRequest(err);
    }

    let vendor = await Vendor.findOne({ id: inputs.vendor })
      .populate('deliveryPartner')
      .populate('pickupAddress');
    let discount;

    if (inputs.discountCode) {
      discount = await Discount.findOne({ code: inputs.discountCode });
    }

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
          'DeliveryPartner of the fulfilment method did not match vendor\'s CHOSEN DeliveryPartner. No other DP should be used.'
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

    if (inputs.discountCode) {
      discount = await Discount.findOne({ code: inputs.discountCode });
    }

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
      let order;

      const createOrderTransactionDB = async (db: any) => {
        for (var item in inputs.items) {
          var orderItemOptionValues = [];
          for (var option in inputs.items[item].options) {
            // options is a dictionary of <string, int> where the int is the selectedProductOptions.id
            if (Object.keys(inputs.items[item]).includes('quantity')){
              orderItemOptionValues.push(
                ...Array(inputs.items[item].quantity).fill({
                  option: option,
                  optionValue: inputs.items[item].options[option],
                })
              );
            }else{
              orderItemOptionValues.push({
                option: option,
                optionValue: inputs.items[item].options[option],
              });
            }
          }
          var newOrderItemOptionValues = [];
          try {
            const dbPromises = orderItemOptionValues.map((o) =>
              wrapWithDb(db, () =>
                OrderItemOptionValue.create(o)
              ).fetch()
            );
            newOrderItemOptionValues = await Promise.all(dbPromises);
          } catch (err) {
            sails.log.error(err);
            // exits.badItemsRequest();
            return {
              orderId: null,
              paymentIntentID: null,
              orderCreationStatus: 'failed',
            };
          }

          // Get array of IDs from array of newOrderItemOptionValues
          inputs.items[item].optionValues = newOrderItemOptionValues.map(
            ({ id: number }) => number
          );
        }

        try {
          order = await wrapWithDb(db, () =>
            Order.create({
              total: inputs.total,
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
                inputs.address.postCode || vendor.pickupAddress.postCode || 'NA11 1AA',
              deliveryAddressLatitude: inputs.address.lat,
              deliveryAddressLongitude: inputs.address.lng,
              deliveryAddressInstructions: inputs.address.deliveryInstructions,
              customerWalletAddress: inputs.walletAddress,
              discount: discount ? discount.id : undefined,
              vendor: vendor.id,
              fulfilmentMethod: inputs.fulfilmentMethod,
              fulfilmentSlotFrom: inputs.fulfilmentSlotFrom,
              fulfilmentSlotTo: inputs.fulfilmentSlotTo,
              tipAmount: inputs.tipAmount,
            })
          ).fetch();
        } catch (error) {
          sails.log.error(`Error on Order.create(...) -> ${error}`);
          // exits.error(error);
          return {
            orderId: null,
            paymentIntentID: null,
            orderCreationStatus: 'failed',
          };
        }

        // Strip unneccesary data from order items
        var updatedItems = _.flatten(_.map(inputs.items, (object) => {
          return Object.keys(object).includes('quantity')
            ? Array(object.quantity).fill({
              order: order.id,
              product: object.id,
              optionValues: object.optionValues,
            })
            : [{
              order: order.id,
              product: object.id,
              optionValues: object.optionValues,
            }];
        }));

        // Create each order item
        const dbPromises = updatedItems.map((o) =>
          wrapWithDb(db, () => OrderItem.create(o))//.fetch()
        );
        await Promise.all(dbPromises);

        // Calculate the order total on the backend
        var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with(
          {
            orderId: order.id,
          }
        );

        // If frontend total is incorrect
        if (order.total !== calculatedOrderTotal.finalAmount) {
          sails.log.warn(`Order total mismatch`);
          sails.log.warn(
            `Order total is ${order.total} but is calculated to be total ${calculatedOrderTotal.finalAmount}`
          );

          if (calculatedOrderTotal.withoutFees <= 0){
            sails.log.warn(
              `New Order #${order.id} has a ${calculatedOrderTotal.withoutFees} subtotal with a total of ${calculatedOrderTotal.finalAmount}`
            );
            // exits.error(`Could not calculate subtotal for order.`);
            return {
              orderId: null,
              paymentIntentID: null,
              orderCreationStatus: 'failed',
            };
          }

        }
        // Update with correct amount
        await wrapWithDb(db, () =>
          Order.updateOne(order.id).set({
            subtotal: calculatedOrderTotal.withoutFees,
            total: calculatedOrderTotal.finalAmount,
          })
        );

        // Return error if vendor minimum order value not met
        if (calculatedOrderTotal.withoutFees < vendor.minimumOrderAmount) {
          sails.log.info('Vendor minimum order value not met');
          // exits.minimumOrderAmount('Vendor minimum order value not met');
          return {
            orderId: null,
            paymentIntentID: null,
            orderCreationStatus: 'failed',
          };
        }

        // All done.
        return {
          orderId: order.id,
          // paymentIntentID: paymentIntentId,
          paymentIntentID: null,
          orderCreationStatus: 'confirmed',
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
      let result; //todo: or just move account find before the transaction...
      if (datastore.config.adapter === 'sails-disk') {
        result = await createOrderTransactionDB(null);
        if(process.env.NODE_ENV && ! process.env.NODE_ENV.toLowerCase().startsWith('prod')){
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
        if(process.env.NODE_ENV && ! process.env.NODE_ENV.toLowerCase().startsWith('prod')){
          sails.log(`create-order -> order created -> ${util.inspect(result, { depth: 0 })}`);
        }
      }

      // Create PaymentIntent on Peepl Pay
      let account: sailsModelKVP<AccountType> | null = null;
      try {
        const accounts = await Account.find({
          walletAddress: inputs.walletAddress,
        });
        if(accounts.length < 1){
          sails.log.error(`Unable to locate account for wallet address used to create-order of "${inputs.walletAddress}"`);
        } else {
          account = accounts[0];
        }
      } catch (error) {
        sails.log.error(`Unable to locate account for wallet address used to create-order of "${inputs.walletAddress}": ${error}`);
      }

      let failureReason;
      try {
        const _newPaymentIntent = await sails.helpers.createPaymentIntentInternal
          .with({
            amount: result.calculatedOrderTotal.finalAmount,
            currency: 'gbp',
            recipientWalletAddress: vendor.walletAddress,
            vendorDisplayName: vendor.name,
            webhookAddress: sails.config.custom.peeplWebhookAddress,
            customerId: '', // TODO: Add StripeCustomerIds to users and then add them here....
            senderWalletAddress: inputs.walletAddress,
            accountId: account && account.id,
            orderId: order.id,
          });
        newPaymentIntent = _newPaymentIntent;
      } catch (error) {
        failureReason = `${error}`;
        sails.log.error(`Failed to create payment intent on helper "createPaymentIntentInternal" with reason: "${failureReason}"`);
      }
        
      
      if (failureReason){
        sails.log.error(new Error(`Error creating payment intent: "${failureReason}"`));
        return exits.success({
          orderId: null,
          paymentIntentID: null,
          orderCreationStatus: 'failed',
        });
      }

      if (!newPaymentIntent) {
        sails.log.error(new Error('Error creating payment intent'));
        return exits.success({
          orderId: null,
          paymentIntentID: null,
          orderCreationStatus: 'failed'
        });
      }
      const paymentIntentId = newPaymentIntent.paymentIntent.id;
      sails.log(`Update order [${order.id}] with paymentIntentId: ${paymentIntentId}`);
      
      try {
        await Order.updateOne(order.id).set({
          paymentIntentId: paymentIntentId,
        });
      } catch (error) {
        sails.log.error(error);
      }
      
      return exits.success({
        orderId: result.orderId,
        paymentIntentID: paymentIntentId,
        orderCreationStatus: result.orderCreationStatus,
      });
    } catch (error) {
      sails.log.error(error);
      try {
        await sails.helpers.sendSmsNotification.with({
          to: inputs.address.phoneNumber,
          body: `We're sorry but your order has been declined by the merchant 😔
For help please contact help@vegiapp.co.uk`,
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
    return exits.success(result);
  },
};
