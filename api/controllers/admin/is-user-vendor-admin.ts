declare var ProductOptionValue: any;
declare var ProductOption: any;
declare var sails: any;

module.exports = {

  friendlyName: 'Is user inventory manager',

  description: '',

  inputs: {
    vendorId: {
      type: 'number',
      required: true,
    }
  },

  exits: {
    success: {
      outputDescription: '`User`s vendor role status',
      outputExample: {
        isAdmin: false,
        vendorID: 0,
      }
    },
    unauthorised: {
      description: 'You are not authenticated',
      responseType: 'unauthorised'
    },
  },

  fn: async function (inputs, exits) {

    var userRoleForVendor = await sails.helpers.getUserroleForVendor.with({
      userId: this.req.session.userId,
      vendorId: inputs.vendorID
    });

    return {
      isAdmin: ['admin'].includes(userRoleForVendor),
      vendorID: inputs.vendorID,
    };

  }

};
