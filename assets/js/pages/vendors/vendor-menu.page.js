parasails.registerPage('vendor-menu', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    addToCartModalActive: false,
    selectedProduct: {},
    isLoading: false,
    productOptions: undefined,
    selectedOptionValues: [],
    total: 0,
    cart: []
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
    clickAddToCart: function(productid) {
      var that = this;

      this.addToCartModalActive = true;
      this.isLoading = true;
      this.selectedProduct = _.find(this.vendor.products, function(o) { return o.id === productid; });

      Cloud.getProductOptions(productid)
      .then(function(options){
        for(var option in options) {
          that.selectedOptionValues[options[option].id] = "";
        }
        that.productOptions = options;
        that.isLoading = false;
      });
    },
    addProductToCart: function() {
      var itemDetails = this.selectedProduct;
    },
    changeOptionValue: function(msg) {
      console.log(msg);
    }
  },
  filters: {
    convertToPounds: function (value) {
      if (!value) return ''
      value = "£" + (value/100);
      value = value.toString()
      return value;
    }
  },
  computed: {
    currentProductTotal: function() {
      var workingTotal = 0;
      workingTotal += this.selectedProduct.basePrice;
      for (value in this.selectedOptionValues) {
        workingTotal += value.priceModifier;
      }
      return workingTotal;
    }
  }
});
