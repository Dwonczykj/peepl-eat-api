module.exports = {


  friendlyName: 'View delivery partners',


  description: 'Display "Delivery partners" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/delivery-partners'
    }

  },


  fn: async function () {

    var deliveryPartners = await DeliveryPartner.find();

    // Respond with view.
    return {
      deliveryPartners: deliveryPartners
    };

  }


};
