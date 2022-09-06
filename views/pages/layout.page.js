parasails.registerPage('layout', {
    //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
    //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
    //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
    data: {
        _loggedIn: null,
    },
    computed: {
        // * Getter -> a computed getter so that computed each time we access it
        isLoggedIn() {
            return this._loggedIn;
        },

    },

    mounted: async function () {
        if (this._loggedIn === null) {
            this._loggedIn = await Cloud.loggedIn();
        }
    },

});
