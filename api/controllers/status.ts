const { version } = require('./../../package.json');

module.exports = {

    friendlyName: 'Api Status',

    description: 'A Development API Status page',

    inputs: {},

    exits: {
        success: {},
    },

    fn: async function (inputs, exits) {
        const out = { version, user: null };
        if (this.req.user) out.user = this.req.user;
        return exits.success(out);
    }

};
