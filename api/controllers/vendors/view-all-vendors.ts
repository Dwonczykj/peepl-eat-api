import { SailsModelType } from '../../../api/interfaces/iSails';
import { PostalDistrictType, VendorType } from "../../../scripts/utils";

declare var PostalDistrict: SailsModelType<PostalDistrictType>;

module.exports = {

  friendlyName: 'View all vendors',

  description: 'Display "All vendors" page.',

  inputs: {
    outcode: {
      type: 'string',
      required: true
    }
  },

  exits: {

    // success: {
    //   viewTemplatePath: 'pages/vendors/all-vendors'
    // },
    successJSON: {
      statusCode: 200,
    },
    notFound: {
      responseType: 'notFound'
    }

  },

  fn: async function (inputs, exits) {
    let postalDistrict: PostalDistrictType;
    try {
      postalDistrict = await PostalDistrict.findOne({
        outcode: inputs.outcode,
      }).populate("vendors&vendors.fulfilmentPostalDistricts");

    } catch (unusedErr) {
      return exits.notFound('OutCode not found');
    }

    if(postalDistrict){
      var vendorsUnsorted = postalDistrict.vendors;

      const vendors = vendorsUnsorted.sort((a, b) => {
        const statae: VendorType['status'][] = ['active', 'draft', 'inactive'];
        return (
          statae.indexOf(a.status) - statae.indexOf(b.status) ||
          a.name.localeCompare(b.name)
        );
      });
      // Respond with view or JSON.
      if(this.req.wantsJSON) {
        return exits.successJSON(
          {vendors: vendors}
        );
      } else {
        return exits.success({ vendors: vendors });
      }
    } else {
      return exits.notFound();
    }
  }
};
