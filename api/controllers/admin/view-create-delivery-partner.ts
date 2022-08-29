declare var DeliveryPartner: any;
module.exports = {


  friendlyName: 'View create delivery partner',


  description: 'Display "Create delivery partner" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-delivery-partner'
    }

  },


  fn: async function (inputs, exits) {

    return exits.success({});

  }


};
