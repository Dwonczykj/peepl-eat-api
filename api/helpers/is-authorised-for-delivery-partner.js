module.exports = {
  friendlyName: "Is authorised for deliveryPartner",

  description:
    "Check if the user is a deliveryPartner User registered to this deliveryPartner or is a superadmin",

  inputs: {
    userId: {
      type: "number",
      required: true,
      description: "The id of the user.",
    },
    deliveryPartnerId: {
      type: "number",
      required: true,
      description: "The id of the delivery partner.",
    },
  },

  exits: {
    success: {
      description: "All done.",
      data: null,
    },

    checkFailed: {
      data: null,
      error: null,
    },

    userNotFound: {

    }
  },

  fn: async function (inputs, exits) {
    // get the user
    const user = await User.findOne({
      id: inputs.userId,
    });

    if(!user){
      sails.log(`helpers.isAuthorisedForDeliveryPartner failed to find user with id: ${inputs.userId}`);
      return exits.userNotFound();
    }

    if (user.isSuperAdmin) {
      return exits.success(true);
    }

    let deliveryPartner = await DeliveryPartner.findOne({
      id: inputs.deliveryPartnerId,
    });

    if (!deliveryPartner) {
      sails.log.info(`Not authorised to view delivery partner route`);
      return exits.success(false);
    }

    // check if the user is authorised for the deliveryPartner
    if (user.deliveryPartner === inputs.deliveryPartnerId) {
      return exits.success(true);
    }

    sails.log.info(
      `User: [${user.name}] is not authorised to view deliveryPartner route for deliveryPartner: ${deliveryPartner.name}. They have access to ${user.deliveryPartner}.`
    );
    return exits.success(false);
  },
};

