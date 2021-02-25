module.exports = {


  friendlyName: 'View edit vendor',


  description: 'Display "Edit vendor" page.',

  inputs: {
    vendorid: {
      type: 'number'
    }
  },

  exits: {

    success: {
      viewTemplatePath: 'pages/admin/edit-vendor'
    }

  },


  fn: async function ({vendorid}, exits) {
    var vendor = await Vendor.findOne(vendorid);

    // Respond with view.
    return exits.success({vendor});

  }


};
