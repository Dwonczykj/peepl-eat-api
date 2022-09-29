module.exports = {
  friendlyName: "View signup",

  description: 'Display "Signup" page.',

  exits: {
    success: {
      viewTemplatePath: "pages/admin/signup",
      data: null,
    },
    successJSON: {
      statusCode: 200,
    },
  },

  fn: async function (inputs, exits) {
    const vendors = await Vendor.find({ status: ["active", "draft"] });

    if (this.req.wantsJSON) {
      return exits.successJSON({
        vendors,
        couriers: [],
      });
    } else {
      return exits.success({data:{
        vendors,
        couriers: [],
      }});
    }
  },
};
