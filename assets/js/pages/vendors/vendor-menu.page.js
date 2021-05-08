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
      email: '',
      phoneNumber: '',
      lineOne: '',
      lineTwo: '',
      postCode: '',
      deliveryInstructions: '',
    },
    marketingOptIn: false,
    syncing: false,
    cloudError: '',
    formErrors: {
    },
    deliveryTotal: 0,
    walletTotal: 0,
    submitted: false,
    processingTopup: false,
    alreadyOptedIn: false,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    _.extend(this, SAILS_LOCALS);

    if (this.user){
      this.address.name = this.user.name;
      this.address.email = this.user.email;
      this.address.lineOne = this.user.addressLineOne;
      this.address.lineTwo = this.user.addressLineTwo;
      this.address.postCode = this.user.postcode;
      this.address.phoneNumber = this.user.phoneNumber;
      this.alreadyOptedIn = this.user.marketingOptIn;
    }
  },
  mounted: async function() {
    this.walletTotal = this.getWalletTotal();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    clickAddToCart: function(productid) {
      var that = this;

      this.addToCartModalActive = true;
      this.isLoading = true;
      this.selectedProduct = _.find(this.vendor.products, (o) => { return o.id === productid; });

      Cloud.getProductOptions(productid)
      .then((options) => {
        that.selectedOptionValues= {};
        for(var option in options) {
          that.selectedOptionValues[options[option].id] = '';
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

      // Product Array
      _paq.push(['addEcommerceItem',
        itemDetails.id, // (required) SKU: Product unique identifier
        itemDetails.name, // (optional) Product name
        this.vendor.name, // (optional) Product category. You can also specify an array of up to 5 categories eg. ["Books", "New releases", "Biography"]
        itemDetails.basePrice / 100, // (Recommended) Product Price
        1 // (Optional - Defaults to 1)
      ]);

      _paq.push(['trackEvent', 'eCommerce', 'Add to cart', itemDetails.name, itemDetails.basePrice]);
    },
    changeOptionValue: function(event) {
      var optionId = event.target.name.slice(7);
      var valueId = event.target.value;

      var option = _.find(this.productOptions, (o) => { return o.id === parseInt(optionId); });
      var value = _.find(option.values, (o) => { return o.id === parseInt(valueId); });

      Vue.set(this.temporaryOptionValues, optionId, {
        valueId,
        priceModifier: value.priceModifier
      });
    },
    changeDeliveryMethod: function (event) {
      var deliveryMethodIndex = event.target.id.slice(14);
      var deliveryMethodId = event.target.options[event.target.options.selectedIndex].value;
      var deliveryMethod =  _.find(this.deliveryMethods[deliveryMethodIndex].deliveryMethods, (o) => { return o.id === parseInt(deliveryMethodId); });

      var that = this;

      for(var product in this.deliveryMethods[deliveryMethodIndex].products) {
        this.cart = _.map(this.cart, (item) => {
          if (item.id === that.deliveryMethods[deliveryMethodIndex].products[product].id) {
            item.deliveryMethod = deliveryMethod;
          }
          return item;
        });
      }

      Vue.set(this.deliveryMethods[deliveryMethodIndex], 'selected', deliveryMethod);
      this.calculateDeliveryTotal();
    },
    // Done like this rather than as a computed property because Vue's deep nested reactive values suck.
    calculateDeliveryTotal: function(){
      var workingTotal = 0;

      for (var methods in this.deliveryMethods) {
        if(this.deliveryMethods[methods] && this.deliveryMethods[methods].selected) {
          workingTotal += this.deliveryMethods[methods].selected.priceModifier;
        }
      }

      this.deliveryTotal = workingTotal;
    },
    changeDeliverySlot: function(event) {
      var deliveryMethodIndex = event.target.id.slice(12);
      var deliverySlotId = event.target.options[event.target.options.selectedIndex].value;
      var deliverySlot =  _.find(this.deliveryMethods[deliveryMethodIndex].selected.deliveryMethodSlots, (o) => { return o.id === parseInt(deliverySlotId); });

      var that = this;

      for(var product in this.deliveryMethods[deliveryMethodIndex].products) {
        this.cart = _.map(this.cart, (item) => {
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

      return {items: this.cart, address: this.address, total: this.cartTotal + this.deliveryTotal, marketingOptIn: this.marketingOptIn};
    },
    startTopUp: function() {
      var amountRequired = (this.cartTotal + this.deliveryTotal - this.walletTotal) / 100; // App handler expects pence!
      var topupDetails = { amount: amountRequired.toString() };

      this.processingTopup = true; // Show 'topup pending' modal
      var that = this;

      window.flutter_inappwebview.callHandler('topup', topupDetails)
      .then((completed) => {
        if(completed) {
          setInterval(() => {
            that.walletTotal = that.getWalletTotal();
            that.syncing = false;
            that.processingTopup = false;
          }, 3000);
        } else {
          that.syncing = false;
          that.processingTopup = false;
        }
      });
    },
    getWalletTotal: function() {
      // TODO: Change this request to be async
      var contractAddress = '0x40AFCD9421577407ABB0d82E2fF25Fd2Ef4c68BD';
      var userWallet = window.SAILS_LOCALS.wallet;
      var data = null;

      $.ajax({
        url: 'https://explorer.fuse.io/api?module=account&action=tokenbalance&contractaddress=' + contractAddress + '&address=' + userWallet,
        type: 'get',
        async: false,
        success: function(res) {
          data = res;
        }
      });

      if(!data) {
        alert('Invalid wallet address');
      }

      var numberOfTokens = parseInt(data.result)/(Math.pow(10,16));

      return numberOfTokens; //In pence
    },
    submittedForm: function(result) {
      this.syncing = true;
      this.submitted = true;
      this.checkoutModalActive = false;

      var paymentDetails = {
        action: 'pay',
        amount: (this.cartTotal + this.deliveryTotal) / 100, //Pence to pounds
        currency: 'GBPX',
        destination: this.vendor.walletId,
        orderId: result.toString()
      };

      // TODO: Change this to send payment information to backend, rather than using webhook from app.
      window.flutter_inappwebview.callHandler('pay', paymentDetails);

      this.submitted = false;
      this.syncing = false;

      window.location.href = '/orders/' + result;

      // Order Array - Parameters should be generated dynamically
      _paq.push(['trackEcommerceOrder',
        paymentDetails.orderId, // (Required) orderId
        paymentDetails.amount, // (Required) revenue
        this.cartTotal / 100, // (Optional) subTotal
        0, // (optional) tax
        this.deliveryTotal / 100, // (optional) shipping
        // false // (optional) discount
      ]);
    },
    updatedPostCode: function () {
      for(var group in this.deliveryMethodsTemp){
        var updatedDms = [];
        for(var deliveryMethodIndex in this.deliveryMethodsTemp[group].deliveryMethods) {
          var deliveryMethod = this.deliveryMethodsTemp[group].deliveryMethods[deliveryMethodIndex];
          var isPostCodeValid = RegExp(deliveryMethod.postCodeRestrictionRegex).test(this.address.postCode);

          if (isPostCodeValid || deliveryMethod.postCodeRestrictionRegex === ''){
            updatedDms.push(deliveryMethod);
          }
        }

        var output = _.cloneDeep(this.deliveryMethodsTemp[group]);

        output.deliveryMethods = updatedDms;
        output.selected = null;
        output.selectedSlot = null;

        if(output.deliveryMethods.length < 1) {
          output.noMethodsAvailable = true;
        } else {
          output.noMethodsAvailable = false;
        }

        Vue.set(this.deliveryMethods, group, output);
        // this.changeDeliveryMethod();
      }
    },
    openCheckoutModal: function() {
      this.isLoading = true;
      this.checkoutModalActive = true;
      var that = this;

      this.walletTotal = this.getWalletTotal();

      var productids = _.pluck(this.cart, 'id');
      var productQuantities = {};

      productids.forEach((val) => {
        productQuantities[val] = (productQuantities[val] || 0 ) + 1;
      });

      Cloud.getProductDeliveryMethods(productids)
      .then((output) => {
        for (var deliveryMethods in output) {
          for(var product in output[deliveryMethods].products) {
            output[deliveryMethods].products[product].quantity = productQuantities[output[deliveryMethods].products[product].id];
          }
        }

        Vue.set(that, 'deliveryMethodsTemp', output);
        that.deliveryMethodsTemp = output;

        if(that.address.postCode !== ''){
          that.updatedPostCode();
        }
      });
      this.isLoading = false;
    },
  },
  filters: {
    convertToPounds: function (value) {
      if (!value) {return '£0';}
      value = '£' + (value/100).toFixed(2);
      value = value.toString();
      return value;
    },
    deliverySlotFilter: function (value) {
      if (!value) {return '';}
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
    finalTotal: function() {
      return this.cartTotal + this.deliveryTotal;
    },
    readyToPay: function() {
      if (this.address.postCode === '') {
        return false;
      }

      if(this.submitted) {
        return false;
      }

      if(this.syncing) {
        return false;
      }

      for (var option in this.deliveryMethods) {
        if (this.deliveryMethods[option].noMethodsAvailable){
          return false;
        }
      }

      if (this.walletTotal < this.cartTotal + this.deliveryTotal) {
        return false;
      }

      return true;
    },
    instructionCharactersRemaining: function() {
      return 200 - this.address.deliveryInstructions.length;
    }
  }
});
