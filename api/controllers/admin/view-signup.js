module.exports = {
  friendlyName: 'View signup',

  description: 'Display "Signup" page.',

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/signup',
      data: null,
    },
    successJSON: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    const vendors = await Vendor.find({ status: ['active', 'draft'] });
    const deliveryPartners = await DeliveryPartner.find({ status: ['active'] });

    if (this.req.wantsJSON) {
      return exits.successJSON({
        vendors,
        deliveryPartners: deliveryPartners,
      });
    } else {
      return exits.success({
        vendors,
        deliveryPartners: deliveryPartners,
      });
    }
  },
};
