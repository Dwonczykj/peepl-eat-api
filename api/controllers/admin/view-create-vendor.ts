declare var DeliveryPartner: any;
module.exports = {


  friendlyName: 'View create vendor',


  description: 'Display "Create vendor" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-vendor'
    }

  },


  fn: async function (inputs, exits) {

    // Get delivery partners
    var deliveryPartners = await DeliveryPartner.find();

    // Respond with view.
    return exits.success({deliveryPartners});

  }


};
