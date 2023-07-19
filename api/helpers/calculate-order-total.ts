import { Currency } from "../../api/interfaces/peeplPay";
import { SailsModelType, sailsVegi } from "../../api/interfaces/iSails";
import { DiscountType, FulfilmentMethodType, OrderType, VendorType } from "../../scripts/utils";

declare var Order: SailsModelType<OrderType>;
declare var Vendor: SailsModelType<VendorType>;
declare var FulfilmentMethod: SailsModelType<FulfilmentMethodType>;
declare var Discount: SailsModelType<DiscountType>;
declare var sails: sailsVegi;

module.exports = {
  friendlyName: 'Calculate order total',

  description:
    'This helper function will allow us to calculate the order total.',

  inputs: {
    orderId: {
      type: 'number',
      description: 'The INTERNAL ID of the order',
      required: true,
    },
    inCurrency: {
      type: 'string',
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
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    const orders = await Order.find({
      id: inputs.orderId,
    }).populate(
      'fulfilmentMethod&deliveryPartner&vendor&discounts&items&items.product&optionValues&optionValues.option&optionValue'
    );

    const order = orders[0];

    let workingTotalGBPx = 0;

    // Add together product totals w/ options
    const fulfilledItems = order.items.filter(
      (item) => item.unfulfilled !== true
    );
    for (var item in fulfilledItems) {
      var productTotal = order.items[item].product.basePrice; // a pence amount

      for (var optionValue in order.items[item].optionValues) {
        productTotal +=
          order.items[item].optionValues[optionValue].optionValue.priceModifier; // a pence amount
      }

      workingTotalGBPx += productTotal;
    }

    // Apply discount
    sails.log.verbose(
      `calculate order total on order with ${
        order.discounts && order.discounts.length
      } discount vouchers applied.`
    );
    if (order.discounts && order.discounts.length > 0) {
      // var discount = await Discount.findOne(order.discount);
      const percentageDiscounts = order.discounts
        .filter((discount) => discount.discountType === 'percentage')
        .sort((b, a) => a.value - b.value);
      const fixedDiscounts = order.discounts.filter(
        (discount) => discount.discountType === 'fixed'
      );
      if (percentageDiscounts && percentageDiscounts.length > 0) {
        // * Only allowed max of one percentage discount code per order
        const largestDiscount = percentageDiscounts[0];
        var multiplier = largestDiscount.value / 100;
        var discountAmount = Math.trunc(workingTotalGBPx * multiplier);
        workingTotalGBPx = workingTotalGBPx - discountAmount;
      }
      for (const discount of fixedDiscounts) {
        if (discount && discount.value) {
          const postOpAmount =
            await sails.helpers.calculateCurrencyOperation.with({
              leftCurrency: Currency.GBPx,
              leftAmount: workingTotalGBPx,
              rightCurrency: discount.currency,
              rightAmount: discount.value,
              operation: 'subtract',
            });
          if (!postOpAmount) {
            sails.log.error(
              `There was an issue calculating the discount for order total in the calculate order total helper. Issue occured when calling calculateCurrencyOp helper.`
            );
          } else {
            workingTotalGBPx = postOpAmount.amount;
          }
        }
      }
    }

    var withoutFees = workingTotalGBPx;

    // Add delivery cost
    var fulfilmentMethod = await FulfilmentMethod.findOne({
      id: order.fulfilmentMethod.id as any,
    });
    workingTotalGBPx += fulfilmentMethod.priceModifier;

    // Add tip amount
    workingTotalGBPx += order.tipAmount; //tipAmount is in GBPx atm

    // Add platform fee (vendor specific)
    var vendor = await Vendor.findOne({ id: order.vendor.id as any });
    var platformFee = vendor.platformFee;
    workingTotalGBPx = workingTotalGBPx + platformFee;

    const withoutFeesInCurrency = await sails.helpers.convertCurrencyAmount.with({
      amount: withoutFees,
      fromCurrency: Currency.GBPx,
      toCurrency: inputs.inCurrency,
    });

    const finalAmountInCurrency =
      await sails.helpers.convertCurrencyAmount.with({
        amount: workingTotalGBPx,
        fromCurrency: Currency.GBPx,
        toCurrency: inputs.inCurrency,
      });

    return exits.success({
      withoutFees: withoutFeesInCurrency,
      finalAmount: finalAmountInCurrency,
      currency: inputs.inCurrency,
    });
  },
};
