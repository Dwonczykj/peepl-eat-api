parasails.registerPage('deliveries', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    yourOrders: [],
    otherOrders: [],
    deliveryIdsMap: {},
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
  },
  mounted: async function () {
    var order;
    for(order in this.yourOrders){
      this.deliveryIdsMap[order.publicId] = order.deliveryId;
    }
    for(order in this.otherOrders){
      this.deliveryIdsMap[order.publicId] = '';
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    clickAcceptDelivery: function (orderId) {
      Cloud.addDeliveryAvailabilityForOrder(orderId, this.deliveryIdsMap[orderId], true) // addDeliveryAvailabilityForOrder method generated by sails integration with cloud SDK.
        .then(() => {
          this.order.courierAccepted = true; // Here we can access state variables on the page without loading the data from the db again!
          this.order.deliveryId = this.deliveryIdsMap[orderId];
          window.location.reload();
        });
    },
    changeCourierDeliveryId: function (orderId, newDeliveryId) {
      this.deliveryIdsMap[orderId] = newDeliveryId;
    },
  }
});
