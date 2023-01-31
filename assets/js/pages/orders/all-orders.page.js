parasails.registerPage('all-orders', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    //…
    timePeriod: '',
    acceptanceStatus: '',
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
    //…
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
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
    },
    capitalise: function (value) {
      if (!value) {return ''; }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
});
