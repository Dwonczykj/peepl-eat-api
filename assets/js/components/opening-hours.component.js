/**
 * <opening-hours>
 * -----------------------------------------------------------------------------
 * Opening hours component used in the edit-vendor screen.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('openingHours', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'fulfilment-method',
  ],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      syncing: false,
      formRules: {
      },
      formErrors: {
      },
      cloudError: '',
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: `
    <ajax-form :form-data="fulfilmentMethod" :syncing.sync="syncing" :form-errors.sync="formErrors" :cloud-error.sync="cloudError" :action="'updateFulfilmentMethod'">
        <div class="my-3 p-3 p-md-4 rounded action-card" v-for="(hours, index) in fulfilmentMethod.openingHours">
            <details>
            <summary class="action-card__summary">
                <span class="action-card__checkbox">
                <input type="checkbox" :id=hours.dayOfWeek v-model="hours.isOpen">
                </span>
                <span :class="{'line-through': !hours.isOpen }">{{hours.dayOfWeek | capitalise}}</span> <div v-if="hours.isOpen" class="text-muted ml-1">{{hours.openTime}} - {{hours.closeTime}}</div>
            </summary>
            <div class="action-card__content">
                <br/>
                <label for="appt">Select opening time:</label>
                <input type="time" id="appt" name="appt" v-model="hours.openTime" :disabled="!hours.isOpen">
                <label for="appt">Select closing time:</label>
                <input type="time" id="appt" name="appt" v-model="hours.closeTime" :disabled="!hours.isOpen">
            </div>
            </details>
        </div>
        <div class="form-group">
          <label for="priceModifier">Price Modifier</label>
          <input :class="{ 'is-invalid': formErrors.priceModifier }" v-model="fulfilmentMethod.priceModifier" type="number" class="form-control" id="priceModifier" required>
          <p class="mt-2 text-muted">{{fulfilmentMethod.priceModifier | convertToPounds}}</p>
        </div>
        <div class="form-group">
          <label for="slotLength">Slot Length (mins)</label>
          <input type="text" :class="{ 'is-invalid': formErrors.slotLength }" v-model="fulfilmentMethod.slotLength" class="form-control" id="slotLength" >
        </div>
        <div class="form-group">
          <label for="bufferLength">Buffer Length (mins)</label>
          <input type="text" :class="{ 'is-invalid': formErrors.bufferLength }" v-model="fulfilmentMethod.bufferLength" class="form-control" id="bufferLength" >
        </div>
        <div class="form-group">
          <label for="maxOrders">Max Orders Per Slot</label>
          <input type="number" :class="{ 'is-invalid': formErrors.maxOrders }" v-model="fulfilmentMethod.maxOrders" class="form-control" id="maxOrders" >
        </div>
        <div class="form-group">
          <label for="orderCutoff">Order Cutoff (on day prior)</label><br/>
          <input type="time" id="orderCutoff" v-model="fulfilmentMethod.orderCutoff">
        </div>
        <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
    </ajax-form>
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
    capitalise: function(value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    convertToPounds: function (value) {
      if (!value) {return '£0';}
      value = '£' + (value/100).toFixed(2);
      value = value.toString();
      return value;
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    //…
  }
});
