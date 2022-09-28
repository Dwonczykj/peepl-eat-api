module.exports = {


    friendlyName: 'View create category group',


    description: 'Display "Create category group" page.',


    exits: {

        success: {
            viewTemplatePath: 'pages/admin/edit-category-group'
        }

    },


    fn: async function (inputs, exits) {

        return exits.success({});

    }


};
