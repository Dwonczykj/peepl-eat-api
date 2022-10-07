module.exports = {


  friendlyName: 'Update User Vendor Role',


  description: 'Update the role of the user at the vendor they are registered to',


  inputs: {
    vendorId: {
      type: 'number',
      required: true,
    },
    vendorRole: {
      type: 'string',
      isIn: ['owner', 'inventoryManager', 'salesManager', 'none'],
      required: true,
    },

  },


  exits: {
    success: {
      outputDescription: '`User`s vendor role has been successfully updated.',
      outputExample: {}
    },
    badRequest: {
      description: 'VendorRole passed does not exist.',
      responseType: 'badRequest',
    },
    notFound: {
      description: 'There is no vendor with that ID!',
      responseType: 'notFound'
    },
    unauthorised: {
      description: 'You are not authorised to have a role with this vendor.',
      responseType: 'unauthorised'
    },
  },


  fn: async function (inputs, exits) {
    let vendor = await Vendor.findOne({ id: inputs.vendorId });

    if (!vendor) {
      return exits.notFound();
    }

    // Check if user is authorised to edit vendor.
    var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
      userId: this.req.session.userId,
      vendorId: vendor.id
    });

    if (!isAuthorisedForVendor) {
      return exits.unauthorised();
    }

    if (!['owner', 'inventoryManager', 'salesManager', 'none'].includes(inputs.vendorRole)) {
      return exits.badRequest();
    }

    var updatedUser = await User.updateOne(inputs.id).set({
      vendorRole: inputs.vendorRole
    });

    // All done.
    return exits.success();

  }


};
