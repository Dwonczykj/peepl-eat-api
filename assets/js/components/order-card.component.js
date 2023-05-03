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
  props: ['order'],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function () {
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
    <p class="m-0"><b>Payment:</b> {{order.paymentStatus}}</p>

    <h2 class="h3 border-top pt-3 mt-3 mb-0">Items:</h2>
    <div v-for="item in order.items">
      <h2 class="h5 border-top pt-3 mt-3 mb-0">{{item.product ? item.product.name : 'UNKNOWN'}}</h2>
      <ol v-if="item.optionValues && item.optionValues.length" class="order-confirmation__option-values">
        <li v-for="optionValue in item.optionValues">
          <b>{{optionValue.option.name}}</b>: {{optionValue.optionValue.name}} ({{optionValue.optionValue.description}})
        </li>
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
    <div v-else>
      <h2 class="h5 border-top pt-3 mt-3 mb-0">Collection details:</h2>
      <p><b>Name:</b> {{order.deliveryName}}
      <br><b>Email:</b> {{order.deliveryEmail}}
      <br><b>Number:</b> <a :href="'tel:'+order.deliveryPhoneNumber">{{order.deliveryPhoneNumber}}</a>
      <br><b>Notes:</b> {{order.deliveryAddressInstructions}}</p>
    </div>
    <h2 class="h5 border-top pt-3 mt-3 mb-0 d-flex">
      <span class="mr-auto">Total</span>
      <span>£{{order.total / 100}}</span>
    </h2>
    <p class="mt-2 mb-0 d-flex text-success">
      <span class="mr-auto">Reward</span>
      <span>+ {{order.rewardsIssued || order.subtotal / 200}} PPL</span>
    </p>
    <div v-if="order.restaurantAcceptanceStatus == 'pending' && isInFuture(order.fulfilmentSlotFrom)">
      <h2 class="h5 border-top pt-3 mt-3 mb-0 d-flex">
        <span class="mr-auto"></span>
      </h2>
      <button :disabled="order.paymentStatus !== 'paid'" class="btn btn-peepl-green" @click="clickApproveOrDeclineOrder('accept')">Approve</button>
      <button :disabled="order.paymentStatus !== 'paid'"  class="btn btn-peepl-red" @click="clickApproveOrDeclineOrder('reject')">Decline</button>
      <button disabled class="btn btn-peepl-red" @click="clickApproveOrDeclineOrder('partial')">Partially fulfil</button>
    </div>
    <div v-else-if="order.restaurantAcceptanceStatus == 'pending' && !isInFuture(order.fulfilmentSlotFrom)">
      <p class="border-top pt-3 mt-3 mb-0 d-flex">
        This order has expired and can no longer be approved.
      </p>
    </div>
    <div v-else-if="order.restaurantAcceptanceStatus == 'accepted' && isInFuture(order.fulfilmentSlotFrom)">
      <p class="border-top pt-3 mt-3 mb-0 d-flex">
        This order has been accepted and can no longer be rejected.
      </p>
    </div>
    <div v-else-if="order.restaurantAcceptanceStatus == 'rejected' && isInFuture(order.fulfilmentSlotFrom)">
      <p class="border-top pt-3 mt-3 mb-0 d-flex">
        This order has been rejected.
      </p>
    </div>

  </div>
</div>
`,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
  },
  mounted: async function () {
    //…
  },
  beforeDestroy: function () {
    //…
  },

  filters: {
    capitalise: function (value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    formatDeliverySlot: function (dateTime) {
      if (!dateTime) {
        return '';
      }
      dateTime = moment(dateTime)
        .utc()
        .calendar(null, {
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
      return dateTime;
    },
    formatOrderedTime: function (unixtime) {
      if (!unixtime) {
        return '';
      }
      unixtime = moment.unix(Math.round(unixtime / 1000)).calendar(null, {
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
    },
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    click: async function () {
      this.$emit('click');
    },
    clickApproveOrDeclineOrder: function (orderFulfilled) {
      var that = this;
      var retainItems = this.order.items.map((item) => item.id);
      var removeItems = [];
      if (orderFulfilled === 'reject') {
        retainItems = [];
        removeItems = this.order.items.map((item) => item.id);
      } else if (orderFulfilled === 'accept') {
        retainItems = this.order.items.map((item) => item.id);
        removeItems = [];
      } else if (orderFulfilled === 'partial') {
        removeItems = this.order.items.map((item) => item.id);
        retainItems = [];
      } else {
        //ignore
      }
      try {
        Cloud.approveOrDeclineOrder(
          this.order.publicId,
          orderFulfilled,
          retainItems,
          removeItems
        ).then(() => {
          if (orderFulfilled === 'accept') {
            that.order.restaurantAcceptanceStatus = 'accepted';
          } else if (orderFulfilled === 'reject') {
            that.order.restaurantAcceptanceStatus = 'rejected';
          } else if (orderFulfilled === 'partial') {
            that.order.restaurantAcceptanceStatus = 'rejected';
          }
        });
      } catch (err) {
        if (err.exit === 'orderNotPaidFor') {
          this.cloudErr = 'Order has not been paid for';
        }
      }
    },
    isInFuture: function (dateTimeString) {
      if (!dateTimeString) {
        return false;
      }
      var dateTime = moment.utc(dateTimeString);
      return dateTime.isAfter(moment.utc());
    },
  },
});
