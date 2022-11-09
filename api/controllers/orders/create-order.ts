
/* eslint-disable camelcase */
declare var OrderItemOptionValue: any;
declare var OrderItem: any;
declare var Order: any;
// declare var _: any;
import _ from 'lodash';
import { OrderType } from '../../../scripts/utils';
import util from 'util';
export type CreateOrderInputs = {
  items: Array<{
    id: number;
    quantity: number;
    options: Array<{ [k: number]: number }>;
    optionValues?: Array<any>;
    order?: number | OrderType;
  }>;
  address: any;
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

export type CreateOrderSuccess = {
  orderId: number;
  paymentIntentID: string;
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
      success: (unusedResult: CreateOrderSuccess) => CreateOrderSuccess;
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
      await sails.helpers.validateOrder.with(inputs);
    } catch (err) {
      return exits.badRequest(err);
    }

    let vendor = await Vendor.findOne({ id: inputs.vendor }).populate(
      'deliveryPartner'
    );
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

      var newPaymentIntent;
      var order;

      const createOrderTransactionDB = async (db: any) => {
        for (var item in inputs.items) {
          var orderItemOptionValues = [];
          for (var option in inputs.items[item].options) {
            // options is a dictionary of <string, int> where the int is the selectedProductOptions.id
            orderItemOptionValues.push({
              option: option,
              optionValue: inputs.items[item].options[option],
            });
          }
          var newOrderItemOptionValues = [];
          try {
            newOrderItemOptionValues = await wrapWithDb(db, () =>
              OrderItemOptionValue.createEach(orderItemOptionValues)
            ).fetch();
          } catch (err) {
            sails.log.error(err);
            exits.badItemsRequest();
            return;
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
              deliveryAddressPostCode: inputs.address.postCode,
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
          exits.error(error);
          return;
        }

        // Strip unneccesary data from order items
        var updatedItems = _.map(inputs.items, (object) => {
          return {
            order: order.id,
            product: object.id,
            optionValues: object.optionValues,
          };
        });

        // sails.log(`Update the ${updatedItems.length} order items in the db: ${util.inspect(updatedItems, {depth: null})}`);
        // Create each order item
        await wrapWithDb(db, () => OrderItem.createEach(updatedItems));

        // Calculate the order total on the backend
        var calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with(
          {
            orderId: order.id,
          }
        );

        // If frontend total is incorrect
        if (order.total !== calculatedOrderTotal.finalAmount) {
          // TODO: Log any instances of this, as it shouldn't happen (indicated frontend logic error)
          sails.log.info(`Order total mismatch`);
          sails.log.info(
            `Order total is ${order.total} but is calculated to be total ${calculatedOrderTotal.finalAmount}`
          );

          // Update with correct amount
          await wrapWithDb(db, () =>
            Order.updateOne(order.id).set({
              subtotal: calculatedOrderTotal.withoutFees,
              total: calculatedOrderTotal.finalAmount,
            })
          );
        }

        // Return error if vendor minimum order value not met
        if (calculatedOrderTotal.withoutFees < vendor.minimumOrderAmount) {
          sails.log.info('Vendor minimum order value not met');
          exits.minimumOrderAmount('Vendor minimum order value not met');
          return;
        }

        // Create PaymentIntent on Peepl Pay
        newPaymentIntent = await sails.helpers
          .createPaymentIntent(
            calculatedOrderTotal.finalAmount,
            vendor.walletAddress, //pushes an update to user via firebase when order has comnpleted via peeplPay posting back to peeplEatWebHook
            vendor.name
          )
          .catch(() => {
            exits.error(new Error('Error creating payment intent'));
            return;
          });

        if (!newPaymentIntent) {
          exits.error(new Error('Error creating payment intent'));
          return;
        }

        // Update order with payment intent
        await wrapWithDb(db, () =>
          Order.updateOne(order.id).set({
            paymentIntentId: newPaymentIntent.paymentIntentId,
          })
        );

        // All done.
        return {
          orderId: order.id,
          paymentIntentID: newPaymentIntent.paymentIntentId,
        };
      };

      if (datastore.config.adapter === 'sails-disk') {
        const result = await createOrderTransactionDB(null);
        sails.log('USING sails-disk');
        sails.log(util.inspect(result, { depth: 0 }));
        if (result) {
          return exits.success(result);
        }
      } else {
        let result;
        await sails
          .getDatastore()
          .transaction(async (db) => {
            result = await createOrderTransactionDB(db);
          })
          .intercept((issues) => {
            sails.log(issues);
            return exits.error(new Error('Error creating Order in DB'));
          });
        sails.log(util.inspect(result, { depth: 0 }));
        return exits.success(result);
      }
    } catch (error) {
      sails.log.error(error);
      return exits.error(new Error('Error creating Order in DB'));
    }
  },
};
