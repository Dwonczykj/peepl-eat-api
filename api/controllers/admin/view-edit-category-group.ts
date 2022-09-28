declare var CategoryGroup: any;
module.exports = {


    friendlyName: 'View edit category group',


    description: 'Display "Edit category group" page.',

    inputs: {
        categoryGroupId: {
            type: 'number'
        }
    },

    exits: {

        success: {
            viewTemplatePath: 'pages/admin/edit-category-group'
        },
        successJSON: {
            statusCode: 200,
        },
        notFound: {
            statusCode: 404,
        }

    },


    fn: async function (inputs, exits) {
        let user = await User.findOne({ id: this.req.session.userId });

        if (!user.isSuperAdmin) {
            return exits.notFound();
        }

        var categoryGroup = await CategoryGroup.findOne(inputs.categoryGroupId);

        if (!categoryGroup) {
            return exits.notFound();
        }

        // Respond with view or JSON.
        if (this.req.wantsJSON) {
            return exits.successJSON(
                { categoryGroup }
            );
        } else {
            return exits.success({ categoryGroup });
        }

    }


};
