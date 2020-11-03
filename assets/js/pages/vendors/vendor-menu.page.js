parasails.registerPage('vendor-menu', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    addToCartModalActive: false,
    checkoutModalActive: false,
    selectedProduct: {},
    isLoading: false,
    productOptions: undefined,
    selectedOptionValues: [],
    temporaryOptionValues: {},
    cart: []
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
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
      var itemDetails = _.cloneDeep(this.selectedProduct);

      itemDetails.options =_.cloneDeep(this.selectedOptionValues);
      itemDetails.total = _.cloneDeep(this.currentProductTotal);
      itemDetails.deliveryMethod = {};

      this.cart.push(itemDetails);
      this.selectedProduct = {};
      this.addToCartModalActive = false;
      this.productOptions = undefined;
      this.selectedOptionValues = [];
      this.temporaryOptionValues = {};
    },
    changeOptionValue: function(event) {
      var optionId = event.target.id.slice(6);
      var valueId = event.target.options[event.target.options.selectedIndex].value;

      var option = _.find(this.productOptions, function(o) { return o.id === parseInt(optionId) });
      var value = _.find(option.values, function(o) { return o.id === parseInt(valueId); });

      Vue.set(this.temporaryOptionValues, optionId, {
        valueId,
        priceModifier: value.priceModifier
      });
    },
    changeDeliveryMethod: function (event) {
      var cartIndex = event.target.id.slice(14);
      var deliveryMethodId = event.target.options[event.target.options.selectedIndex].value;
      var deliveryMethod =  _.find(this.cart[cartIndex].deliveryMethods, function(o) { return o.id === parseInt(deliveryMethodId); });

      this.cart[cartIndex].deliveryMethod.id = deliveryMethodId;
      this.cart[cartIndex].deliveryMethod.priceModifier = deliveryMethod.priceModifier;
    },
    updatedPostCode: function () {
      for(var item in this.cart) {
        Vue.set(this.cart[item], 'deliveryMethod', {});
        Vue.set(this.cart[item], 'deliveryMethods', deliveryMethods[this.cart[item].id]);
      }
    },
    openCheckoutModal: function() {
      this.isLoading = true;
      this.checkoutModalActive = true;
      var that = this;

      var productids = _.pluck(this.cart, 'id');

      Cloud.getProductDeliveryMethods(productids)
      .then(function(deliveryMethods){
        that.deliveryMethods = deliveryMethods;
      })

      this.isLoading = false;
    }
  },
  filters: {
    convertToPounds: function (value) {
      if (!value) return '£0'
      value = "£" + (value/100);
      value = value.toString()
      return value;
    }
  },
  computed: {
    currentProductTotal: function() {
      var workingTotal = 0;
      workingTotal += this.selectedProduct.basePrice;
      for (var value in this.temporaryOptionValues) {
        workingTotal += this.temporaryOptionValues[value].priceModifier;
      }
      return workingTotal;
    },
    cartTotal: function() {
      var workingTotal = 0;
      for (var item in this.cart) {
        workingTotal += this.cart[item].total;
      }
      return workingTotal;
    },
    deliveryTotal: function() {
      var workingTotal = 0;
      
      for (var item in this.cart) {
        if (this.cart[item].deliveryMethod.priceModifier){
          workingTotal += this.cart[item].deliveryMethod.priceModifier;
        }
      }

      return workingTotal;
    }
  }
});
