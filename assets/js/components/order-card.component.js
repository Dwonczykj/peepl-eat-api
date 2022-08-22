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
  <div class="my-3 p-3 bg-grey rounded">
  <p class="text-muted m-0">Order #{{order.id}}</p>
  <p>Status: {{order.restaurantAcceptanceStatus | capitalise}}</p>
  <div v-for="item in order.items">
    <h2 class="h5 border-top pt-3 mt-3 mb-0">{{item.product.name}}</h2>
    <ol v-if="item.optionValues && item.optionValues.length" class="order-confirmation__option-values">
      <li v-for="optionValue in item.optionValues"><b>{{optionValue.option.name}}</b>: {{optionValue.optionValue.name}}</li>
    </ol>
  </div>
  <h2 class="h5 border-top pt-3 mt-3 mb-0">Delivery details:</h2>
    <p><b>Name:</b> {{order.deliveryName}}
    <br><b>Email:</b> {{order.deliveryEmail}}
    <br><b>Number:</b> <a :href="'tel:'+order.deliveryPhoneNumber">{{order.deliveryPhoneNumber}}</a>
    <br><b>Line One:</b> {{order.deliveryAddressLineOne}}
    <br><b>Line Two:</b> {{order.deliveryAddressLineTwo}}
    <br><b>Post Code:</b> {{order.deliveryAddressPostCode}}
    <br><b>Notes:</b> {{order.deliveryAddressInstructions}}
  <h2 class="h5 border-top pt-3 mt-3 mb-0 d-flex">
    <span class="mr-auto">Total</span>
    <span>£{{order.total / 100}}</span>
  </h2>
  <p class="mt-2 mb-0 d-flex text-success">
    <span class="mr-auto">Reward</span>
    <span>+ {{order.total / 100}} PPL</span>
  </p>
</div>`,

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
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    click: async function(){
      this.$emit('click');
    },
  }
});
