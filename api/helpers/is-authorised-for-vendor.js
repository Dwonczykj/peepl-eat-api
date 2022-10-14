module.exports = {
  friendlyName: "Is authorised for vendor",

  description:
    "Check if the user is a vendor User registered to this vendor or is a superadmin",

  inputs: {
    userId: {
      type: "number",
      required: true,
      description: "The id of the user.",
    },
    vendorId: {
      type: "number",
      required: true,
      description: "The id of the vendor.",
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
      sails.log(`helpers.isAuthorisedForVendor failed to find user with id: ${inputs.userId}`);
      return exits.userNotFound();
    }

    if (user.isSuperAdmin) {
      return exits.success(true);
    }

    let vendor = await Vendor.findOne({
      id: inputs.vendorId,
    });

    if (!vendor) {
      sails.log.info(`Not authorised to view vendor route`);
      return exits.success(false);
    }

    // check if the user is authorised for the vendor
    if (user.vendor === inputs.vendorId) {
      return exits.success(true);
    }

    sails.log.info(`Not authorised to view vendor route`);
    return exits.success(false);
  },
};

