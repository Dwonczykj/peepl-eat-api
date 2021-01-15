parasails.registerPage('bar-menu', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    destinationWallet: '0x47b2706a3af571142966d4eb73e1006ef84b4b74',
    quantities: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0
    },
    // Is customer good or bad (i.e. did they travel by car)
    isGood: false,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
  },

  computed: {
    total: function() {
        var workingTotal = 0;
        for(var product in this.quantities) {
            var productData = _.find(this.products, {id: 1});
            workingTotal += (this.isGood) ? productData.reducedPrice * this.quantities[product] : productData.fullPrice * this.quantities[product];
        }
        return workingTotal;
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
      sendPayment: function(e) {
        e.preventDefault();

        Cloud.createOrder(this.quantities)
        .then(function(msg){
            console.log(msg);
        })

        var paymentDetails = {
            action: 'pay',
            amount: this.total,
            currency: 'GBPx',
            destination: this.destinationWallet,
        };
        window.flutter_inappwebview.callHandler('pay', paymentDetails).then(function (result) {
            // get result from Flutter side. It will be the number 64.
            console.log(result);
        });
      }
  }
});