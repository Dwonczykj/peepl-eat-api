import { AvailableDateOpeningHours } from '../../../api/helpers/get-available-dates';
import { FulfilmentMethodType } from '../../../scripts/utils';
import { sailsVegi } from '../../interfaces/iSails';
declare var sails: sailsVegi;

export type GetEligibleOrderUpdates = {
  vendor: number;
  deliveryPartner?: number;
}

export type getEligibleOrderDatesSuccess = {
  [unusedMethodType in FulfilmentMethodType['methodType']]: AvailableDateOpeningHours;
};


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
      collection: eligibleCollectionDates,
      delivery: eligibleDeliveryDates,
    });
  },
};
