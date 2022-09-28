module.exports = {


  friendlyName: 'View category groups',


  description: 'Display "Category Groups" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/admin/category-groups'
    },
    successJSON: {
      statusCode: 200,
    },

  },


  fn: async function (inputs, exits) {

    var categoryGroups = await CategoryGroup.find({});

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON(
        { categoryGroups }
      );
    } else {
      return exits.success({ categoryGroups });
    }

  }


};
