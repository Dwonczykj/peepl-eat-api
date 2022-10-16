import { iCollectionDates, intersectSlotArrays, iSlot, mergeICollectionDates, Slot } from '../../interfaces/vendors/slot';
import util from 'util';
import e from 'express';
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

  fn: async function (inputs, exits) {
    var deliverySlots: iSlot[] = [];
    var collectionSlots: iSlot[] = [];
    var eligibleCollectionDates: iCollectionDates = {
      availableDaysOfWeek: [],
      availableSpecialDates: [],
    };
    var eligibleDeliveryDates = {
      availableDaysOfWeek: [],
      availableSpecialDates: [],
    };

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
        sails.log.warn(`No deliveryFulfilmentMethod set on delivery partner: ${deliveryPartner.name}`);
      } else {
        try {
          deliverySlots = await sails.helpers.getAvailableSlots(
            inputs.date,
            deliveryPartner.deliveryFulfilmentMethod.id
          );
          eligibleDeliveryDates = await sails.helpers.getAvailableDates(
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
        let vendorEligibleDeliveryDates: iCollectionDates = {
          availableDaysOfWeek: [],
          availableSpecialDates: [],
        };

        try {
	        vendorDeliverySlots =
	          await sails.helpers.getAvailableSlots(
	            inputs.date,
	            vendor.deliveryFulfilmentMethod.id
	          );
	        vendorEligibleDeliveryDates =
	          await sails.helpers.getAvailableDates(
	            vendor.deliveryFulfilmentMethod.id
	          );
        } catch (error) {
          sails.log.error(`Error fetching available slots and dates for vendor. ${error}`);
        }
        deliverySlots = intersectSlotArrays(
          deliverySlots.map((slot) => Slot.from(slot)),
          vendorDeliverySlots.map((slot) => Slot.from(slot))
        );
        eligibleDeliveryDates = mergeICollectionDates(
          eligibleDeliveryDates,
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
