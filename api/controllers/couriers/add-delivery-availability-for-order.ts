import moment from "moment";
import { Slot } from "../../interfaces/vendors/slot";

module.exports = {
  friendlyName: "Add delivery availability to order",

  description:
    "For deliveryPartners to verify that they have riders available to service an order before the order has been sent to the vendor to be confirmed.",

  inputs: {
    vegiOrderId: {
      type: "string",
      description: "The Public id relating to the order in the vegi db",
      required: true,
    },
    deliveryId: {
      type: "string",
      description:
        "The delivery id generated by the deliveryPartner to be added here so that it can be added to the order for tracking.",
      required: true,
    },
    deliveryPartnerAccepted: {
      type: "boolean",
      required: true,
    },
  },

  exits: {
    orderAlreadyHasDeliveryPartner: {
      statusCode: 401,
      description: "A deliveryPartner has already accepted this order",
    },
    deliveryPartnerUnableToServiceSlot: {
      statusCode: 404,
      description: "DeliveryPartner does not have a slot to service this order",
    },
    notFound: {
      statusCode: 404,
      description: "No order found for order id",
    },
    unauthorisedUser: {
      statusCode: 401,
      description: "A deliveryPartner has already accepted this order",
    },
  },

  fn: async function (inputs, exits) {
    // Method protected by config/policies.js
    let order;
    try {
      order = await Order.findOne({
        publicId: inputs.vegiOrderId,
        completedFlag: "",
      }).populate("fulfilmentMethod&deliveryPartner");
    } catch (error) {
      sails.log.error(
        `Request to add delivery availability for order with vegi public id: ${inputs.vegiOrderId} -> failed to find this order. Error: ${error}`
      );
      order = null;
      return exits.notFound();
    }

    if (!order) {
      return exits.notFound();
    }

    if (
      order.deliveryPartnerAccepted ||
      order.deliveryPartnerConfirmed ||
      order.deliveryPartner
    ) {
      // throw new Error('A deliveryPartner has already accepted this order.');
      return exits.orderAlreadyHasDeliveryPartner();
    }

    //TODO: Check that the Fulfilment Slots of delivery partner accepting this request include the order delivery slot
    let deliveryPartner;
    try {
      deliveryPartner = await DeliveryPartner.findOne({
        users: { contains: this.req.session.userId },
      }).populate("deliveryFulfilmentMethod");
    } catch (error) {
      sails.log.error(
        `Request to add delivery availability for order with vegi public id: ${inputs.vegiOrderId} -> failed to find the delivery partner for this user. Error: ${error}`
      );
      deliveryPartner = null;
      return exits.notFound();
    }

    if (!deliveryPartner) {
      return exits.notFound();
    }
    if (deliveryPartner.deliveryFulfilmentMethod) {
      // Check that delivery partner can service this delivery slot
      const dPdeliverySlots: Slot[] = await sails.helpers
        .getAvailableSlots(
          inputs.date,
          deliveryPartner.deliveryFulfilmentMethod.id
        )
        .map((slot) => Slot.from(slot));
      const slotOk =
        dPdeliverySlots.filter((slot) => {
          moment.utc(order.fulfilmentSlotFrom).isSameOrAfter(slot.startTime) &&
            moment.utc(order.fulfilmentSlotFrom).isSameOrBefore(slot.endTime) &&
            moment.utc(order.fulfilmentSlotTo).isSameOrAfter(slot.startTime) &&
            moment.utc(order.fulfilmentSlotTo).isSameOrBefore(slot.endTime);
        }).length > 0;
      if (!slotOk) {
        return exits.deliveryPartnerUnableToServiceSlot();
      }
    }

    await Order.updateOne({ publicId: inputs.vegiOrderId }).set({
      deliveryPartnerAccepted: inputs.deliveryPartnerAccepted,
      deliveryPartner: inputs.deliveryPartnerAccepted
        ? deliveryPartner.id
        : null,
      deliveryId: inputs.deliveryId,
      deliveryPartnerConfirmed: false,
    });

    // All done.
    return exits.success();
  },
};
