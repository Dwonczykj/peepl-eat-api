/* eslint-disable no-unused-vars */
import { iCollectionDates, intersectTimeWindowArrays, iSlot, mergeAvailableDates, mergeICollectionDates, TimeWindow } from '../../interfaces/vendors/slot';
import util from 'util';
import { FulfilmentMethodType } from '../../../scripts/utils';
import { AvailableDateOpeningHours } from '../../../api/helpers/get-available-dates';

export type GetFulilmentSlotsSuccess = {
  collectionMethod: FulfilmentMethodType;
  deliveryMethod: FulfilmentMethodType;
  collectionSlots: iSlot[];
  deliverySlots: iSlot[];
  eligibleCollectionDates: AvailableDateOpeningHours;
  eligibleDeliveryDates: AvailableDateOpeningHours;
};

module.exports = {
  friendlyName: "Get fulfilment slots",

  description: "",

  inputs: {
    vendor: {
      type: "number",
      required: true,
    },
    date: {
      type: "string",
      required: true,
      regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
    },
  },

  exits: {
    success: {
      statusCode: 200,
    },
    vendorNotFound: {
      statusCode: 404,
    },
    deliveryPartnerNotFound: {
      statusCode: 500,
    },
  },

  fn: async function (
    inputs: {
      vendor: number;
      date: string;
    },
    exits: {
      success: (args: GetFulilmentSlotsSuccess) => GetFulilmentSlotsSuccess;
      vendorNotFound: () => void;
      deliveryPartnerNotFound: () => void;
    }
  ) {
    var collectionSlots: iSlot[] = [];
    var deliveryPartnerDeliverySlots: iSlot[] = [];
    var deliverySlots: iSlot[] = [];
    var eligibleDeliveryDates: AvailableDateOpeningHours = {};
    var eligibleCollectionDates: AvailableDateOpeningHours = {};
    var eligibleDeliveryPartnerDeliveryDates: AvailableDateOpeningHours = {};

    var vendor = await Vendor.findOne(inputs.vendor).populate(
      "deliveryFulfilmentMethod&collectionFulfilmentMethod&deliveryPartner"
    );

    if (!vendor) {
      return exits.vendorNotFound();
    }

    let collectionFulfilmentMethod = vendor.collectionFulfilmentMethod;
    let deliveryFulfilmentMethod = vendor.deliveryFulfilmentMethod;

    // If the vendor has a delivery partner associated with it, then we need to get the delivery slots for that partner.
    if (vendor.deliveryPartner && vendor.deliveryPartner.status === "active") {
      var deliveryPartner = await DeliveryPartner.findOne(
        vendor.deliveryPartner.id
      ).populate("deliveryFulfilmentMethod");
      if (!deliveryPartner) {
        sails.log.error(
          `DeliveryPartner not found on vendor: ${util.inspect(vendor, {
            depth: null,
          })}`
        );
      }
      if (!deliveryPartner.deliveryFulfilmentMethod) {
        sails.log.warn(
          `No deliveryFulfilmentMethod set on delivery partner: ${deliveryPartner.name}`
        );
      } else {
        try {
          deliveryPartnerDeliverySlots = await sails.helpers.getAvailableSlots(
            inputs.date,
            deliveryPartner.deliveryFulfilmentMethod.id
          );
          eligibleDeliveryPartnerDeliveryDates =
            await sails.helpers.getAvailableDates(
              deliveryPartner.deliveryFulfilmentMethod.id
            );
        } catch (error) {
          sails.log.error(
            `Error fetching available slots and dates for vendor's delivery partner '${deliveryPartner.name}'. ${error}`
          );
        }
      }

      deliveryFulfilmentMethod = deliveryPartner.deliveryFulfilmentMethod;
      if (vendor.deliveryFulfilmentMethod) {
        let vendorDeliverySlots: iSlot[] = [];
        let vendorEligibleDeliveryDates: AvailableDateOpeningHours = {};

        try {
          vendorDeliverySlots = await sails.helpers.getAvailableSlots(
            inputs.date,
            vendor.deliveryFulfilmentMethod.id
          );
          vendorEligibleDeliveryDates = await sails.helpers.getAvailableDates(
            vendor.deliveryFulfilmentMethod.id
          );
        } catch (error) {
          sails.log.error(
            `Error fetching available slots and dates for vendor. ${error}`
          );
        }
        deliverySlots = intersectTimeWindowArrays(
          deliveryPartnerDeliverySlots.map((slot) => TimeWindow.from(slot)),
          vendorDeliverySlots.map((slot) => TimeWindow.from(slot))
        );
        eligibleDeliveryDates = mergeAvailableDates(
          eligibleDeliveryPartnerDeliveryDates,
          vendorEligibleDeliveryDates
        );
      }
    } else if (vendor.deliveryFulfilmentMethod) {
      try {
        deliverySlots = await sails.helpers.getAvailableSlots(
          inputs.date,
          vendor.deliveryFulfilmentMethod.id
        );
        eligibleDeliveryDates = await sails.helpers.getAvailableDates(
          vendor.deliveryFulfilmentMethod.id
        );
      } catch (error) {
        sails.log.error(
          `Error fetching available slots and dates from vendor's deliveryFulfilmentMethod. ${error}`
        );
      }
    }

    if (vendor.collectionFulfilmentMethod) {
      try {
        collectionSlots = await sails.helpers.getAvailableSlots(
          inputs.date,
          vendor.collectionFulfilmentMethod.id
        );
        eligibleCollectionDates = await sails.helpers.getAvailableDates(
          vendor.collectionFulfilmentMethod.id
        );
      } catch (error) {
        sails.log.error(
          `Error fetching available slots and dates from vendor's collectionFulfilmentMethod. ${error}`
        );
      }
    }

    return exits.success({
      collectionMethod: collectionFulfilmentMethod,
      deliveryMethod: deliveryFulfilmentMethod,
      collectionSlots,
      deliverySlots,
      eligibleCollectionDates,
      eligibleDeliveryDates,
    });
  },
};
