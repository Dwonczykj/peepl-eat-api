import util from "util";
import moment from 'moment';
import { DeliveryPartnerType, FulfilmentMethodType, VendorType } from "../../../scripts/utils";
import { NextAvailableDateHelperReturnType } from "../../../api/helpers/next-available-date";
import { iSlot } from "../../../api/interfaces/vendors/slot";

type GetNextFulfilmentSlotSuccess = {
  collectionMethod: FulfilmentMethodType;
  deliveryMethods: FulfilmentMethodType[];
  nextCollectionSlot: iSlot;
  nextDeliverySlot: iSlot;
  nextEligibleCollectionDate: NextAvailableDateHelperReturnType;
  nextEligibleDeliveryDate: NextAvailableDateHelperReturnType;
};

module.exports = {
  friendlyName: "Get fulfilment slots",

  description: "",

  inputs: {
    vendor: {
      type: "number",
      required: true,
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
    inputs: { vendor: number },
    exits: {
      success: (
        unused: GetNextFulfilmentSlotSuccess
      ) => GetNextFulfilmentSlotSuccess;
      vendorNotFound: () => void;
      deliveryPartnerNotFound: () => void;
    }
  ) {
    var vendor: VendorType = await Vendor.findOne(inputs.vendor).populate(
      "deliveryFulfilmentMethod&collectionFulfilmentMethod&deliveryPartner"
    );

    if (!vendor) {
      return exits.vendorNotFound();
    }

    let collectionFulfilmentMethod: FulfilmentMethodType =
      vendor.collectionFulfilmentMethod;
    const deliveryFulfilmentMethods: Array<FulfilmentMethodType> = [
      vendor.deliveryFulfilmentMethod,
    ];
    if (vendor.deliveryFulfilmentMethod) {
      deliveryFulfilmentMethods.push(vendor.deliveryFulfilmentMethod);
    }

    // If the vendor has a delivery partner associated with it, then we need to get the delivery slots for that partner.
    if (vendor.deliveryPartner && vendor.deliveryPartner.status === "active") {
      var deliveryPartner: DeliveryPartnerType = await DeliveryPartner.findOne(
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
        deliveryFulfilmentMethods.push(
          deliveryPartner.deliveryFulfilmentMethod
        ); // Todo: FIX this overrides the vendor deliveryFulfilmentMethod above...
      }
    }

    let nextDeliverySlot: {
      startTime: moment.Moment;
      endTime: moment.Moment;
    };
    let nextEligibleDeliveryDate: NextAvailableDateHelperReturnType;
    try {
      nextDeliverySlot = await sails.helpers.nextAvailableSlot.with({
        fulfilmentMethodIds: deliveryFulfilmentMethods.map((dfm) => dfm.id),
      });
      nextEligibleDeliveryDate = await sails.helpers.nextAvailableDate.with({
        fulfilmentMethodIds: deliveryFulfilmentMethods.map((dfm) => dfm.id),
      });
    } catch (error) {
      sails.log.error(
        `Error fetching next available slot and date for vendor:'${vendor.name}' & deliveryPartner: '${vendor.deliveryPartner.name}'. ${error}`
      );
    }

    let nextCollectionSlot: {
      startTime: moment.Moment;
      endTime: moment.Moment;
    };
    let nextEligibleCollectionDate: NextAvailableDateHelperReturnType;
    if (vendor.collectionFulfilmentMethod) {
      try {
        nextCollectionSlot = await sails.helpers.nextAvailableSlot.with({
          fulfilmentMethodIds: [vendor.collectionFulfilmentMethod.id],
        });
        nextEligibleCollectionDate = await sails.helpers.nextAvailableDate.with(
          {
            fulfilmentMethodIds: [vendor.collectionFulfilmentMethod.id],
          }
        );
      } catch (error) {
        sails.log.error(
          `Error fetching next available slot and dates from vendor's collectionFulfilmentMethod. ${error}`
        );
      }
    }

    return exits.success({
      collectionMethod: collectionFulfilmentMethod,
      deliveryMethods: deliveryFulfilmentMethods,
      nextCollectionSlot,
      nextDeliverySlot,
      nextEligibleCollectionDate,
      nextEligibleDeliveryDate,
    });
  },
};
