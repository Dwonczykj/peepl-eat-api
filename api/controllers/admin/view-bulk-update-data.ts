import { UserType } from "../../../scripts/utils";
import { sailsModelKVP, SailsModelType, sailsVegi } from "../../interfaces/iSails";

declare var sails: sailsVegi;
declare var User: SailsModelType<UserType>;

module.exports = {
  friendlyName: 'View Bulk Update Data',

  exits: {
    success: {
      viewTemplatePath: 'pages/admin/bulk-update-data',
    },
    successJSON: {
      statusCode: 200,
    },
  },

  fn: async function (
    inputs,
    exits: {
      success: (unusedViewData: { user: sailsModelKVP<UserType> }) => void;
      successJSON: (unusedViewData: { user: sailsModelKVP<UserType> }) => void;
    }
  ) {
    if (!this.req.session.userId) {
      return this.res.redirect('/');
    }
    const isSuperAdmin = await sails.helpers.isSuperAdmin.with({
      userId: this.req.session.userId,
    });
    if (!isSuperAdmin.data) {
      return this.res.redirect('/');
    }

    let user = await User.findOne({ id: this.req.session.userId });

    // Respond with view or JSON.
    if (this.req.wantsJSON) {
      return exits.successJSON({ user });
    } else {
      return exits.success({ user });
    }
  },
};
