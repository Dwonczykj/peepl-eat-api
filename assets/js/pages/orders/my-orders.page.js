parasails.registerPage('my-orders', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    orders: []
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function() {
    _.extend(this, SAILS_LOCALS);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    //…
  },
  filters: {
    formatDeliverySlot: function(unixtime) {
      if (!unixtime) {
        return '';
      }
      unixtime = moment.unix(unixtime).calendar(null, {
        lastDay: '[Yesterday]',
        // sameDay: '[Today]',
        sameDay: function (now) {
          if (this.isBefore(now)) {
            return '[Will Happen Today]';
          } else {
            return '[Happened Today]';
          }
        },
        nextDay: '[Tomorrow]',
        lastWeek: '[last] dddd',
        nextWeek: 'dddd',
        sameElse: 'DD/MM/YYYY', // ~ https://momentjs.com/docs/#/displaying/calendar-time/
      }); // ~ https://stackoverflow.com/a/41260094
      return unixtime;
    }
  }
});
