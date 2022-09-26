parasails.registerPage('approve-delivery-availability', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    deliveryId: '',
    order: {},
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
  },
  mounted: async function () {
    this.deliveryId = '';
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    clickAddDeliveryAvailabilityForOrder: function (isApproved) {
      if(isApproved && !this.deliveryId){
        throw 'Courier deliveryId required to approve a delivery.';
      }

      Cloud.addDeliveryAvailabilityForOrder(this.order.publicId, this.deliveryId, isApproved) // addDeliveryAvailabilityForOrder method generated by sails integration with cloud SDK.
        .then(() => {
          this.order.courierAccepted = isApproved; // Here we can access state variables on the page without loading the data from the db again!
          if (isApproved){
            this.order.deliveryId = this.deliveryId;
          }
        });
    },

    changeCourierDeliveryId: function(newDeliveryId) {
      this.deliveryId = newDeliveryId;
    },
  }
});
