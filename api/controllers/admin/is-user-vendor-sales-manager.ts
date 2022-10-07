declare var ProductOptionValue: any;
declare var ProductOption: any;
declare var sails: any;

module.exports = {

  friendlyName: 'Is user sales manager',

  description: '',

  inputs: {
    vendorId: {
      type: 'number',
      required: true,
    }
  },

  exits: {
    success: {
      outputDescription: '`User`s sales management status',
      outputExample: {
        isSalesManager: false,
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
      isSalesManager: ['admin', 'owner', 'salesManager'].includes(userRoleForVendor),
      vendorID: inputs.vendorID,
    };

  }

};
