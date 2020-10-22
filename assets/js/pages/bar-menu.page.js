parasails.registerPage('bar-menu', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    destinationWallet: '0x47b2706a3af571142966d4eb73e1006ef84b4b74',
    // products:{
    //     1: {
    //         id: 1,
    //         name: 'Love Lane Lager',
    //         description: 'One of the city’s best loved beers, made with Pilsner and Munich malts for a delicate, herbal brew. Love Lane’s brewery, about 100 metres from here, on the site of an old rubber factory, can produce over 3 million pints of this gorgeous amber nectar at a time.',
    //         fullPrice: 5.00,
    //         reducedPrice: 4.60
    //     },
    //     2: {
    //         id: 2,
    //         name: 'Pomegranate Gin Fizz',
    //         description: 'This combination of pomegranate with Persian rose petals and Turkish apple creates a particularly aromatic and refreshing gin. Mix that with some sweetness, some lime, and some club soda – delicious!',
    //         fullPrice: 7.50,
    //         reducedPrice: 6.80
    //     },
    //     3: {
    //         id: 3,
    //         name: 'Gin & Tonic',
    //         description: 'Choose from traditional dry gin, sophisticated pomegranate, or moody coffee & vanilla – all distilled around 80 metres away in the Love Lane Brewery and bottled by hand.',
    //         fullPrice: 5.00,
    //         reducedPrice: 4.50
    //     },
    //     4: {
    //         id: 4,
    //         name: 'Dark & Stormzy',
    //         description: 'AKA dark rum and coke, with a splash of fresh lime. The fine rum at the heart of this drink is made by the Big Bog Brewing company, a real living wage employer based in Speke.',
    //         fullPrice: 4.50,
    //         reducedPrice: 4.10
    //     },
    //     5: {
    //         id: 5,
    //         name: 'Oolong Tea',
    //         description: 'A Chinese speciality oolong tea, grown in the Fujian province. Calming, tasty and quite refreshing after, or before, a drink or two – it is a Monday after all.',
    //         fullPrice: 3.00,
    //         reducedPrice: 2.70
    //     }, 
    //     6: {
    //         id: 6,
    //         name: 'Elderflower Collins',
    //         description: 'Refreshingly zingy. Love Lane dry gin, lemon, sugar and elderflower cordial. Not much history to this drink other than it came from a Google search and the BBC Good Food guide.',
    //         fullPrice: 7.50,
    //         reducedPrice: 6.80
    //     }, 
    //     7: {
    //         id: 7,
    //         name: 'Mineral Water',
    //         description: 'All the classics.',
    //         fullPrice: 2.00,
    //         reducedPrice: 1.80
    //     }, 
    //     8: {
    //         id: 8,
    //         name: 'Proper Scouse Tap Water',
    //         description: 'Liverpool’s finest, which it turns out actually comes from Lake Vymwy, in the Welsh hills. We thought it was the Mersey at first, but looking at the Mersey lately, we’re quite glad it’s not.',
    //         fullPrice: 0.00,
    //         reducedPrice: 0.00
    //     }
    //         },
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
            var productData = _.find(this.products, {id: product}).reducedPrice
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
        // window.flutter_inappwebview.callHandler('pay', paymentDetails).then(function (result) {
        //     // get result from Flutter side. It will be the number 64.
        //     console.log(result);
        // });
      }
  }
});