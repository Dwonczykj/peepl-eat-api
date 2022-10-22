import { AvailableDateOpeningHours } from 'api/helpers/get-available-dates';
import { getEligibleOrderDatesSuccess, GetEligibleOrderUpdates } from '../../interfaces';
import { sailsVegi } from '../../interfaces/iSails';
declare var sails: sailsVegi;


module.exports = {
  friendlyName: "Get eligible order dates",

  description: "Get eligible order dates",

  inputs: {
    vendor: {
      type: "number",
      required: true,
    },
    deliveryPartner: {
      type: "number",
      allowNull: true,
    },
  },

  // inputs: sails.helpers.generateSchema('orders/iGetEligibleOrderUpdates', 'GetEligibleOrderUpdates'),

  exits: {
    success: {
      statusCode: 200,
      data: null,
      exampleOutput: {
        data: {
          collectionMethod: {
            createdAt: 1661434438245,
            updatedAt: 1661434438245,
            id: 2,
            name: "",
            description: "",
            priceModifier: 0,
            methodType: "collection",
            slotLength: 60,
            bufferLength: 0,
            orderCutoff: null,
            maxOrders: 0,
            vendor: 1,
            deliveryPartner: null,
          },
          deliveryMethod: {
            createdAt: 1661434438220,
            updatedAt: 1661434438220,
            id: 1,
            name: "",
            description: "",
            priceModifier: 0,
            methodType: "delivery",
            slotLength: 60,
            bufferLength: 0,
            orderCutoff: null,
            maxOrders: 0,
            vendor: 1,
            deliveryPartner: null,
          },
          eligibleCollectionDates: {
            availableDaysOfWeek: ["friday"],
            availableSpecialDates: [],
          },
          eligibleDeliveryDates: {
            availableDaysOfWeek: ["monday", "wednesday"],
            availableSpecialDates: [],
          },
        },
      },
    },
  },

  fn: async function (
    inputs: GetEligibleOrderUpdates,
    exits: {
      success: (unused:getEligibleOrderDatesSuccess) => getEligibleOrderDatesSuccess;
    }
  ) {
    var eligibleCollectionDates: AvailableDateOpeningHours = {};
    var eligibleDeliveryDates: AvailableDateOpeningHours = {};

    var vendor = await Vendor.findOne(inputs.vendor).populate(
      "deliveryFulfilmentMethod&collectionFulfilmentMethod"
    );

    let _deliveryPartner;
    try {
      _deliveryPartner = await DeliveryPartner.findOne(
        inputs.deliveryPartner
      ).populate("deliveryFulfilmentMethod");
    } catch (unusedError) {
      // ignore
    }
    const deliveryPartner = _deliveryPartner;

    const deliveryFMIds: Array<number> = [];
    if (vendor.deliveryFulfilmentMethod) {
      // eligibleDeliveryDates = await sails.helpers.getAvailableDates(vendor.deliveryFulfilmentMethod.id);
      deliveryFMIds.push(vendor.deliveryFulfilmentMethod.id);
    }

    if (deliveryPartner && deliveryPartner.deliveryFulfilmentMethod) {
      deliveryFMIds.push(deliveryPartner.deliveryFulfilmentMethod.id);
    }

    if (deliveryFMIds.length > 0) {
      eligibleDeliveryDates = await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: deliveryFMIds,
      });
    }

    if (vendor.collectionFulfilmentMethod) {
      eligibleCollectionDates = await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: [vendor.collectionFulfilmentMethod.id],
      });
    }

    return exits.success({
      collectionMethod: vendor.collectionFulfilmentMethod,
      deliveryMethod: vendor.deliveryFulfilmentMethod, // *always use vendor deliveryFM for orders
      eligibleCollectionDates,
      eligibleDeliveryDates,
    });
  },
};
