/**
 * <order-card>
 * -----------------------------------------------------------------------------
 * Order component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('order-card', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'order',
  ],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      //…
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: `
<div>
  <div class="my-3 p-3 bg-grey rounded">
    <p class="text-muted m-0">Order #{{order.id}}</p>
    <p class="m-0"><b>Status:</b> <span :class="(order.restaurantAcceptanceStatus == 'accepted') ? 'text-success' : ''">{{order.restaurantAcceptanceStatus | capitalise}}</span></p>
    <p class="m-0"><b>Fulfilment Time:</b> {{order.fulfilmentSlotFrom | formatDeliverySlot}} - {{order.fulfilmentSlotTo | formatDeliverySlot}}</p>
    <p class="m-0"><b>Fulfilment Type:</b> {{order.fulfilmentMethod.methodType | capitalise}}</p>
    <p class="m-0"><b>Ordered:</b> {{order.paidDateTime | formatOrderedTime}}</p>

    <h2 class="h3 border-top pt-3 mt-3 mb-0">Items:</h2>
    <div v-for="item in order.items">
      <h2 class="h5 border-top pt-3 mt-3 mb-0">{{item.product.name}}</h2>
      <ol v-if="item.optionValues && item.optionValues.length" class="order-confirmation__option-values">
        <li v-for="optionValue in item.optionValues"><b>{{optionValue.option.name}}</b>: {{optionValue.optionValue.name}}</li>
      </ol>
    </div>

    <div v-if="order.fulfilmentMethod.methodType == 'delivery'">
      <h2 class="h5 border-top pt-3 mt-3 mb-0">Delivery details:</h2>
      <p><b>Name:</b> {{order.deliveryName}}
      <br><b>Email:</b> {{order.deliveryEmail}}
      <br><b>Number:</b> <a :href="'tel:'+order.deliveryPhoneNumber">{{order.deliveryPhoneNumber}}</a>
      <br><b>Line One:</b> {{order.deliveryAddressLineOne}}
      <br><b>Line Two:</b> {{order.deliveryAddressLineTwo}}
      <br><b>Post Code:</b> {{order.deliveryAddressPostCode}}
      <br><b>Notes:</b> {{order.deliveryAddressInstructions}}</p>
    </div>
    <h2 class="h5 border-top pt-3 mt-3 mb-0 d-flex">
      <span class="mr-auto">Total</span>
      <span>£{{order.total / 100}}</span>
    </h2>
    <p class="mt-2 mb-0 d-flex text-success">
      <span class="mr-auto">Reward</span>
      <span>+ {{order.total / 100}} PPL</span>
    </p>
    <div v-if="order.restaurantAcceptanceStatus == 'pending' && isInFuture(order.fulfilmentSlotFrom)">
      <h2 class="h5 border-top pt-3 mt-3 mb-0 d-flex">
        <span class="mr-auto"></span>
      </h2>
      <button class="btn btn-peepl-green" @click="clickApproveOrDeclineOrder(true)">Approve</button>
      <button class="btn btn-peepl-red" @click="clickApproveOrDeclineOrder(false)">Decline</button>
    </div>
    <div v-else-if="order.restaurantAcceptanceStatus == 'pending' && !isInFuture(order.fulfilmentSlotFrom)">
      <p class="border-top pt-3 mt-3 mb-0 d-flex">
        This order has expired and can no longer be approved.
      </p>
    </div>

  </div>
</div>
`,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function(){
    //…
  },
  beforeDestroy: function() {
    //…
  },

  filters: {
    capitalise: function (value) {
      if (!value) {return ''; }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    formatDeliverySlot: function(dateTime) {
      if (!dateTime) {return '';}
      dateTime = moment(dateTime).calendar();
      return dateTime;
    },
    formatOrderedTime: function(unixtime) {
      if (!unixtime) {return '';}
      unixtime = moment.unix(Math.round(unixtime/1000)).calendar();
      return unixtime;
    },
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    click: async function(){
      this.$emit('click');
    },
    clickApproveOrDeclineOrder: function(isApproved){
      var that = this;
      Cloud.approveOrDeclineOrder(this.order.publicId, isApproved)
      .then(() => {
        if(isApproved){
          that.order.restaurantAcceptanceStatus = 'accepted';
        } else {
          that.order.restaurantAcceptanceStatus = 'rejected';
        }
      });
    },
    isInFuture: function(dateTimeString){
      if (!dateTimeString) {return false;}
      var dateTime = moment(dateTimeString);
      return dateTime.isAfter(moment());
    }
  }
});
