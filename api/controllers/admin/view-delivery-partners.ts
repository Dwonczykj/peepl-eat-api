import { sailsModelKVP, SailsModelType } from "../../../api/interfaces/iSails";
import { DeliveryPartnerType } from "../../../scripts/utils";

declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;

type ViewDeliveryPartnersResponse = {
  deliveryPartners: Array<DeliveryPartnerType | sailsModelKVP<DeliveryPartnerType>>;
};

module.exports = {
  friendlyName: 'View delivery partners',

  description: 'Display "Delivery partners" page.',

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/delivery-partners',
    },
  },

  fn: async function (
    inputs: {},
    exits: {
      success: (
        unusedArg: ViewDeliveryPartnersResponse
      ) => ViewDeliveryPartnersResponse;
      successJSON: (
        unusedArg: ViewDeliveryPartnersResponse
      ) => ViewDeliveryPartnersResponse;
    }
  ) {
    var deliveryPartners = await DeliveryPartner.find();

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({
        deliveryPartners: deliveryPartners,
      });
    } else {
      return exits.success({
        deliveryPartners: deliveryPartners,
      });
    }
  },
};
