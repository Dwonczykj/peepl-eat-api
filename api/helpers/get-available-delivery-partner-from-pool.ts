/* eslint-disable no-console */
import moment from 'moment';
import {
  DeliveryInformation, DeliveryPartnerObject, getDeliveryPartnerHelpers, IDeliveryPartner
} from "../interfaces/orders/deliveryPartnerHelperObjects";
import { Slot } from "../interfaces/vendors/slot";

declare var FulfilmentMethod: any;
declare var sails: any;
declare var DeliveryPartner: any;

module.exports = {
  friendlyName: "Get available deliveryPartner from pool",

  description:
    "Get an available deliveryPartner from the pool of deliveryPartners",

  inputs: {
    // fulfilmentMethodId: {
    //   type: 'number',
    //   required: true,
    //   description: 'The ID of the fulfilmentMethod which is being requested.'
    // },
    fulfilmentSlotFrom: {
      type: "string",
      required: true,
      description:
        "The date for which time slots need to be generated. Format YYYY-MM-DD",
      // example: '2022-03-24',
      // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    },
    fulfilmentSlotTo: {
      type: "string",
      required: true,
      description:
        "The date for which time slots need to be generated. Format YYYY-MM-DD",
      // example: '2022-03-24',
      // regex: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    },
    pickupFromVendor: {
      type: "number",
      required: true,
    },
    deliveryContactName: {
      type: "string",
      required: true,
    },
    deliveryPhoneNumber: {
      type: "string",
      required: true,
    },
    deliveryComments: {
      type: "string",
      required: true,
    },
    deliveryAddressLineOne: {
      type: "string",
      required: true,
    },
    deliveryAddressLineTwo: {
      type: "string",
      defaultsTo: "",
    },
    deliveryAddressCity: {
      type: "string",
      required: true,
    },
    deliveryAddressPostCode: {
      type: "string",
      required: true,
    },
    // deliverBefore: {
    //   type: 'number',
    //   description: 'a unix timestamp for a delivery slot deadline bound to be converted to string by moment.js',
    // },
    // deliverAfter: {
    //   type: 'number',
    //   description: 'a unix timestamp for a delivery slot start bound to be converted to string by moment.js',
    // }
  },

  exits: {
    success: {
      // outputFriendlyName: 'Available slots',
    },
    deliveryPartnerDoesNotHaveDeliveryFulfilmentSetUp: {
      
    }
  },

  fn: async function (inputs, exits) {
    var validSlotsForDeliveryPartner = [];
    var date = moment
      .utc(inputs.fulfilmentSlotFrom, "YYYY-MM-DD HH:mm:ss")
      .format("YYYY-MM-DD");

    const deliveryPartners = await DeliveryPartner.find({
      status: "active",
      //contains: {deliversToPostCodes: [inputs.deliveryAddressPostCode]},
    });
    sails.log(`Got All (${deliveryPartners.length}) DeliveryPartners`);
    const availableDeliveryPartnerInfos = [];
    // check if delivery slot is valid for any delivery partners
    for (let deliveryPartner of deliveryPartners) {
      const deliveryPartnerFulfilmentMethod = await FulfilmentMethod.findOne({
        deliveryPartner: deliveryPartner.id,
        methodType: "delivery",
      }).populate("openingHours");

      if (!deliveryPartnerFulfilmentMethod) {
        return exits.deliveryPartnerDoesNotHaveDeliveryFulfilmentSetUp();
      }

      try {
        validSlotsForDeliveryPartner =
          await sails.helpers.getAvailableSlots.with({
            date,
            fulfilmentMethodId: deliveryPartnerFulfilmentMethod.id,
          });
      } catch (error) {
        sails.log.error(
          `helpers.getAvailableSlots blew up when in getAvailableDeliveryPartnerFromPool: ${error}`
        );
      }

      if (!validSlotsForDeliveryPartner) {
        sails.log(
          `helpers.getAvailableDeliveryPartnerFromPool found no valid slots from helpers.getAvailableSlots`
        );
        return exits.noValidSlots();
      }

      // Find slot within list of valid slots
      const availableSlot = validSlotsForDeliveryPartner
        .map(
          (slot) =>
            new Slot({ startTime: slot.startTime, endTime: slot.endTime })
        )
        .find((slot) => {
          return slot.overlapsWith(
            new Slot({
              startTime: moment.utc(inputs.fulfilmentSlotFrom),
              endTime: moment.utc(inputs.fulfilmentSlotTo),
            })
          );
        });
      if (availableSlot) {
        availableDeliveryPartnerInfos.push({
          deliveryPartner: deliveryPartner,
          fulfilmentMethod: deliveryPartnerFulfilmentMethod,
          slot: availableSlot,
        });
      }
    }

    if (!availableDeliveryPartnerInfos) {
      return exits.success({});
    }

    const availableDeliveryPartners = availableDeliveryPartnerInfos.map(
      (val) => val.deliveryPartner
    );
    const deliveryPartnerHelpers: Array<DeliveryPartnerObject> =
      getDeliveryPartnerHelpers(sails, availableDeliveryPartners);

    var chosenDeliveryPartner: IDeliveryPartner = null;
    var deliverBefore = moment.utc(
      inputs.fulfilmentSlotFrom,
      "YYYY-MM-DD HH:mm:ss"
    );
    var deliverAfter = moment.utc(
      inputs.fulfilmentSlotTo,
      "YYYY-MM-DD HH:mm:ss"
    );

    const vendor = await Vendor.findOne({ id: inputs.pickupFromVendor });

    for (const deliveryPartner of deliveryPartnerHelpers) {
      sails.log(
        "getAvailableDeliveryPartnerFromPool -> requestProvisionalDeliveryAvailability for " +
          deliveryPartner.deliveryPartnerName
      );
      const deliveryAvailability =
        await deliveryPartner.requestProvisionalDeliveryAvailability(
          new DeliveryInformation(
            deliverBefore,
            deliverAfter,
            vendor.pickupAddressLineOne,
            vendor.pickupAddressLineTwo,
            vendor.pickupAddressCity,
            vendor.pickupAddressPostCode,
            vendor.name,
            inputs.deliveryContactName,
            inputs.deliveryPhoneNumber,
            inputs.deliveryComments,
            inputs.deliveryAddressLineOne,
            inputs.deliveryAddressLineTwo,
            inputs.deliveryAddressCity,
            inputs.deliveryAddressPostCode
          )
        );
      sails.log(
        `${deliveryPartner.deliveryPartnerName} ${deliveryAvailability.status} delivery`
      );
      if (!deliveryPartner.requestDeliveryAvailability) {
        chosenDeliveryPartner = deliveryPartner;
        sails.log("DONE getAvailableDeliveryPartnerFromPool");
        return exits.success(chosenDeliveryPartner.deliveryPartner);
      }
      if (deliveryAvailability.status === "accepted") {
        chosenDeliveryPartner = deliveryPartner;
        sails.log("DONE getAvailableDeliveryPartnerFromPool");
        return exits.success(chosenDeliveryPartner.deliveryPartner);
      } else if (
        deliveryAvailability.status === "pending" &&
        chosenDeliveryPartner === null
      ) {
        chosenDeliveryPartner = deliveryPartner;
      }
    }
    sails.log("DONE getAvailableDeliveryPartnerFromPool");
    return exits.success(chosenDeliveryPartner.deliveryPartner);
  },
};
