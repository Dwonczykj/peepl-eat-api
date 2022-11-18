declare var DeliveryPartner: any;
module.exports = {


  friendlyName: 'View edit delivery partner',


  description: 'Display "Edit delivery partner" page.',

  inputs: {
    deliveryPartnerId: {
      type: 'number'
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-delivery-partner'
    },
    successJSON: {
      statusCode: 200,
    },
    notFound: {
      statusCode: 404,
    }

  },


  fn: async function (inputs, exits) {
    let user = await User.findOne({id: this.req.session.userId});

    if(!user.isSuperAdmin) {
      return exits.notFound();
    }

    var deliveryPartner = await DeliveryPartner.findOne(
      inputs.deliveryPartnerId
    ).populate(
      'deliveryOriginAddress&deliveryFulfilmentMethod&deliveryFulfilmentMethod.openingHours'
    );

    if(!deliveryPartner) {
      return exits.notFound();
    }

    if(!deliveryPartner.deliveryOriginAddress){
      deliveryPartner.deliveryOriginAddress = {
        label: '',
        addressLineOne: '',
        addressLineTwo: '',
        addressTownCity: '',
        addressPostCode: '',
        addressCountryCode: '',
        latitude: null,
        longitude: null,
      };
    }

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON(
        {deliveryPartner}
      );
    } else {
      return exits.success({deliveryPartner});
    }

  }


};
