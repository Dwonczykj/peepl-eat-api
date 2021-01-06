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
    cart: [],
    deliveryMethods: {},
    deliveryMethodsTemp: {},
    address:{
      name: '',
      lineOne: '',
      lineTwo: '',
      postCode: ''
    },
    syncing: false,
    cloudError: '',
    formErrors: {
    },
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
          that.selectedOptionValues= {};
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
      this.productOptions = {};
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
      var deliveryMethodIndex = event.target.id.slice(14);
      var deliveryMethodId = event.target.options[event.target.options.selectedIndex].value;
      var deliveryMethod =  _.find(this.deliveryMethods[deliveryMethodIndex].deliveryMethods, function(o) { return o.id === parseInt(deliveryMethodId); });

      var that = this;

      for(var product in this.deliveryMethods[deliveryMethodIndex].products) {
        this.cart = _.map(this.cart, function(item) {
          if (item.id === that.deliveryMethods[deliveryMethodIndex].products[product].id) {
            item.deliveryMethod = deliveryMethod;
          }
          return item;
        });
      }

      Vue.set(this.deliveryMethods[deliveryMethodIndex], 'selected', deliveryMethod);
    },
    changeDeliverySlot: function(event) {
      var deliveryMethodIndex = event.target.id.slice(12);
      var deliverySlotId = event.target.options[event.target.options.selectedIndex].value;
      var deliverySlot =  _.find(this.deliveryMethods[deliveryMethodIndex].selected.deliveryMethodSlots, function(o) { return o.id === parseInt(deliverySlotId); });

      var that = this;

      for(var product in this.deliveryMethods[deliveryMethodIndex].products) {
        this.cart = _.map(this.cart, function(item) {
          if (item.id === that.deliveryMethods[deliveryMethodIndex].products[product].id) {
            item.deliverySlot = deliverySlot;
          }
          return item;
        });
      }

      Vue.set(this.deliveryMethods[deliveryMethodIndex], 'selectedSlot', deliverySlot);
    },
    handleParsingForm: function() {
      this.syncing = true;

      return {items: this.cart, address: this.address, total: this.cartTotal + this.deliveryTotal};
    },
    submittedForm: function(result) {
      console.log("Submitted form.");

      this.syncing == true;
      var paymentDetails = {
          action: 'pay',
          amount: this.cartTotal + this.deliveryTotal,
          currency: 'GBPx',
          destination: this.vendor.walletId,
      };

      window.flutter_inappwebview.callHandler('pay', paymentDetails)
      .then(function (paymentResult) {
        Cloud.paymentSubmitted()
        .protocol('io.socket')
        .then(function(msg){
          //Payment was successful.
          window.location('/order/' + paymentResult.id);
        })
        .catch(function(err){

        })
      })
      .catch(function(err){

      })


    },
    updatedPostCode: function () {
      for(var group in this.deliveryMethodsTemp){
        var updatedDms = [];
        for(var deliveryMethodIndex in this.deliveryMethodsTemp[group].deliveryMethods) {
          var deliveryMethod = this.deliveryMethodsTemp[group].deliveryMethods[deliveryMethodIndex];
          var isPostCodeValid = RegExp(deliveryMethod.postCodeRestrictionRegex).test(this.address.postCode);

          console.log(this.address.postCode);

          if (isPostCodeValid || deliveryMethod.postCodeRestrictionRegex == ""){
            updatedDms.push(deliveryMethod);
          }
        }

        var output = this.deliveryMethodsTemp[group];

        output.deliveryMethods = updatedDms;
        output.selected = null;
        output.selectedSlot = null;

        Vue.set(this.deliveryMethods, group, output);
      }
    },
    openCheckoutModal: function() {
      this.isLoading = true;
      this.checkoutModalActive = true; 
      var that = this;

      var productids = _.pluck(this.cart, 'id');
      var productQuantities = {};

      productids.forEach(function(val){
        productQuantities[val] = (productQuantities[val] || 0 ) + 1;
      })

      Cloud.getProductDeliveryMethods(productids)
      .then(function(output){
        for (var deliveryMethods in output) {
          for(var product in output[deliveryMethods].products) {
            output[deliveryMethods].products[product].quantity = productQuantities[output[deliveryMethods].products[product].id];
          }
        }

        Vue.set(that, 'deliveryMethodsTemp', output);
        that.deliveryMethodsTemp = output;
      })

      this.isLoading = false;
    }
  },
  filters: {
    convertToPounds: function (value) {
      if (!value) return '£0'
      value = "£" + (value/100).toFixed(2);
      value = value.toString()
      return value;
    },
    deliverySlotFilter: function (value) {
      if (!value) return '';
      value = moment.unix(value).calendar();
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
      for (var methods in this.deliveryMethods) {
        if(this.deliveryMethods[methods] && this.deliveryMethods[methods].selected) {
          workingTotal += this.deliveryMethods[methods].selected.priceModifier;
        }
      }
      return workingTotal;
    }
  }
});
