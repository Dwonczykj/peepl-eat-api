parasails.registerPage('order-confirmation', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    order: {}
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
    var that = this;
    //Subscribe to messages about order
    io.socket.get('/api/v1/orders/subscribe-to-order/' + that.order.id);

    // Order marked as paid
    io.socket.on('paid', (data) => {
      that.order.paidDateTime = data.paidDateTime;
      _paq.push(['trackEvent', 'eCommerce', 'Completed order', data.orderId, this.cartTotal + this.deliveryTotal]);
    });

    io.socket.on('paymentError', (data) => {
      alert(data.message);
    });
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
