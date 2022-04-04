module.exports = {


  friendlyName: 'View postal districts',


  description: 'Display "Postal districts" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/postal-districts'
    }

  },


  fn: async function () {
    // Get the list of postal districts.
    var postalDistricts = await PostalDistrict.find();

    // Respond with view.
    return {
      postalDistricts: postalDistricts
    };

  }


};
