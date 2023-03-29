import { SailsModelType } from '../../../api/interfaces/iSails';
import { VendorType } from "../../../scripts/utils";

declare var Vendor: SailsModelType<VendorType>;
module.exports = {

  friendlyName: 'View vendors',

  description: 'Display "Vendors" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/vendors'
    },
    successJSON: {
      statusCode: 200,
    }

  },

  fn: async function (inputs, exits) {
    var vendorsUnsorted = await Vendor.find();

    const vendors = vendorsUnsorted.sort((a, b) => {
      const statae: VendorType['status'][] = ['active', 'draft', 'inactive'];
      return (
        statae.indexOf(a.status) - statae.indexOf(b.status) ||
        a.name.localeCompare(b.name)
      );
    });

    // Respond with view or JSON.
    if(this.req.wantsJSON) {
      return exits.successJSON({
        vendors: vendors,
        userRole: this.req.session.userRole,
      });
    } else {
      return exits.success({
        vendors: vendors,
        userRole: this.req.session.userRole,
      });
    }

  }

};
