/**
 * Notification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { v4: uuidv4 } = require("uuid");
module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    recipient: {
      type: "string",
      description: "The number, email or firebase topicid of the recipient",
      required: true,
    },
    type: {
      type: "string",
      description: "The URL of the vendor category image.",
      isIn: ["sms", "email", "push"],
    },
    sentAt: {
      type: "number",
      description: "The unixtime when the notification was sent.",
      required: true,
    },
    publicId: {
      type: "string",
    },
    title: {
      type: "string",
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    order: {
      model: "order",
      description:
        "the linked order if there was an order linked to this notification (nullable)",
    },
  },

  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.publicId = `${valuesToSet.type}-${valuesToSet.recipient}-${
      valuesToSet.sentAt
    }-${uuidv4()}`;
    return proceed();
  },
};
