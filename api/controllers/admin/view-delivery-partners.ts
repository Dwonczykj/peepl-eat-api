import { sailsModelKVP, SailsModelType } from "../../../api/interfaces/iSails";
import { DeliveryPartnerType } from "../../../scripts/utils";

declare var DeliveryPartner: SailsModelType<DeliveryPartnerType>;

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
      success: (unusedArg: {
        deliveryPartners: Array<sailsModelKVP<DeliveryPartnerType>>;
      }) => { deliveryPartners: Array<sailsModelKVP<DeliveryPartnerType>> };
      successJSON: (unusedArg: {
        deliveryPartners: Array<sailsModelKVP<DeliveryPartnerType>>;
      }) => { deliveryPartners: Array<sailsModelKVP<DeliveryPartnerType>> };
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
