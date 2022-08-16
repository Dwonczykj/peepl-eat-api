declare var PostalDistrict: any;

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
    var postalDistrict = await PostalDistrict.findOne({outcode: inputs.outcode})
    .populate('vendors');

    if(postalDistrict){
      // Respond with view or JSON.
      if(this.req.wantsJSON) {
        return exits.successJSON(
          {vendors: postalDistrict.vendors}
        );
      } else {
        return exits.success({vendors: postalDistrict.vendors});
      }
    } else {
      return exits.notFound();
    }
  }
};
