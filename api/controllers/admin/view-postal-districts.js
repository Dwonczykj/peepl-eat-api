module.exports = {


  friendlyName: 'View postal districts',


  description: 'Display "Postal districts" page.',


  exits: {
    success: {
      viewTemplatePath: 'pages/admin/postal-districts'
    },
    successJSON: {
      statusCode: 200,
    }

  },


  fn: async function (inputs, exits) {
    // Get the list of postal districts.
    var postalDistricts = await PostalDistrict.find();

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(
        { postalDistricts }
      );
    } else {
      return exits.success({ postalDistricts });
    }

  }


};
