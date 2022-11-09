import util from "util";
// import moment from 'moment';
import { DeliveryPartnerType, FulfilmentMethodType, VendorType } from "../../../scripts/utils";
import { NextAvailableDateHelperReturnType } from "../../../api/helpers/next-available-date";
import { iFulfilmentSlotHttpResponse, iFulfilmentSlot } from '../../../api/interfaces/vendors/slot';
import { sailsVegi } from "../../../api/interfaces/iSails";
import { stringifySlotUsingMomentUTCDefault } from "../../../scripts/stringifySlot";

declare var sails: sailsVegi;

export type GetNextFulfilmentSlotSuccess = {
  slot: {
    [unusedMethodType in FulfilmentMethodType['methodType']]: iFulfilmentSlotHttpResponse;
  };
  // date: {
  //   [unusedMethodType in FulfilmentMethodType['methodType']]: NextAvailableDateHelperReturnType;
  // };
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

    let deliverySlot: iFulfilmentSlot;
    let nextEligibleDeliveryDate: NextAvailableDateHelperReturnType;
    try {
      deliverySlot = await sails.helpers.nextAvailableSlot.with({
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

    let collectionSlot: iFulfilmentSlot;
    let nextEligibleCollectionDate: NextAvailableDateHelperReturnType;
    if (vendor.collectionFulfilmentMethod) {
      try {
        collectionSlot = await sails.helpers.nextAvailableSlot.with({
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
      slot: {
        collection:
          collectionSlot && stringifySlotUsingMomentUTCDefault(collectionSlot),
        delivery:
          deliverySlot && stringifySlotUsingMomentUTCDefault(deliverySlot),
      },
      // date: {
      //   collection: nextEligibleCollectionDate,
      //   delivery: nextEligibleDeliveryDate,
      // },
    });
  },
};
