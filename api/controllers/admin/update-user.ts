module.exports = {


  friendlyName: 'Update User Vendor Role',


  description: 'Update the role of the user at the vendor they are registered to',


  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    vendorId: {
      type: 'number',
      required: true,
    },
    vendorRole: {
      type: 'string',
      isIn: ['owner', 'inventoryManager', 'salesManager', 'courier', 'none'],
    },
    name: {
      type: 'string',
    },
    role: {
      type: 'string',
      isIn: ['owner', 'staff', 'courier'],
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
    // TODO: Test this
    let myUser = await User.findOne({ id: this.req.session.userId });

    let userToUpdate = await User.findOne({ email: inputs.email });

    let updateUserObj = {

    };
    if (Object.keys(inputs).includes('name'))
      updateUserObj['name'] = inputs.name;
    if (Object.keys(inputs).includes('role'))
      updateUserObj['role'] = inputs.name;


    if (Object.keys(inputs).includes('vendorId')) {
      //TODO: Check that the user is registered to a vendor and that it matches the vendor in the inputs (request)
      let vendor = await Vendor.findOne({ id: inputs.vendorId });

      if (!vendor) {
        throw 'notFound';
      }
      // Check if admin user is authorised to edit vendor.
      var isAuthorisedForVendor = await sails.helpers.isAuthorisedForVendor.with({
        userId: this.req.session.userId,
        vendorId: vendor.id
      });

      if (!isAuthorisedForVendor) {
        throw 'unauthorised';
      }

      if (!['owner', 'inventoryManager', 'salesManager', 'courier', 'none'].includes(inputs.vendorRole)) {
        throw 'badRequest';
      }

      updateUserObj['vendorRole'] = inputs.vendorRole;
      updateUserObj['vendor'] = vendor;

    }

    var updatedUser = await User.updateOne(inputs.id).set(updateUserObj);

    // All done.
    return exits.success();

  }


};
