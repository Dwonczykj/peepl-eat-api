import { sailsVegi } from "../../../api/interfaces/iSails";

declare var DeliveryPartner: any;
declare var sails: sailsVegi;
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
    )
      .populate(
        'deliveryFulfilmentMethod.fulfilmentOrigin&openingHours'
      );

    if(!deliveryPartner) {
      return exits.notFound();
    }

    if (!deliveryPartner.deliveryFulfilmentMethod.fulfilmentOrigin) {
      deliveryPartner.deliveryFulfilmentMethod.fulfilmentOrigin = {
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
      return exits.successJSON({
        deliveryPartner,
        googleApiKey: sails.config.custom.distancesApiKey,
      });
    } else {
      return exits.success({
        deliveryPartner,
        googleApiKey: sails.config.custom.distancesApiKey,
      });
    }

  }


};
