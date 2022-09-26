
declare var User: any;

module.exports = {

  friendlyName: 'Get userroles for vendor',


  description: '',


  inputs: {
    userId: {
      type: 'number',
      required: true,
      description: 'The id of the user.',
    },
    vendorId: {
      type: 'number',
      required: true,
      description: 'The id of the vendor.',
    },
  },

  exits: {

    success: {
      description: 'All done.',
    },

  },

  fn: async function (inputs) {
    // get the user
    const user: any = await User.findOne({
      id: inputs.userId,
    });

    if (user.isSuperAdmin) {
      return 'admin';
    }

    let vendor = await Vendor.findOne({
      id: inputs.vendorId,
    });

    if (!vendor) {
      return 'none';
    }

    // check if the user is authorised for the vendor
    if (user.vendor === inputs.vendorId) {
      return user.vendorRole;
    }

    return 'none';
  },
};
