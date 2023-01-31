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
  props: ['fulfilment-method', 'google-api-key'],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function () {
    return {
      syncing: false,
      formRules: {},
      formErrors: {},
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
          <label for="maxDeliveryDistance">Max Delivery Distance (KM)</label>
          <input type="number" :class="{ 'is-invalid': formErrors.maxDeliveryDistance }" v-model="fulfilmentMethod.maxDeliveryDistance" class="form-control" id="maxDeliveryDistance" >
        </div>
        <div v-if="fulfilmentMethod.methodType !== 'collection'">
          <h2 class="h5 mt-3">Fulfilment Origin</h2>
          <div class="form-group">
            <label for="addressLineOne">Address Line 1</label>
            <input type="text" :class="{ 'is-invalid': formErrors.addressLineOne }" 
              v-model="fulfilmentMethod.fulfilmentOrigin.addressLineOne"
              class="form-control" id="addressLineOne">
          
            <label for="addressLineTwo">Address Line 2</label>
            <input type="text" :class="{ 'is-invalid': formErrors.addressLineTwo }" 
              v-model="fulfilmentMethod.fulfilmentOrigin.addressLineTwo"
              class="form-control" id="addressLineTwo">
          
            <label for="addressTownCity">Address City</label>
            <input type="text" :class="{ 'is-invalid': formErrors.addressTownCity }" v-model="fulfilmentMethod.fulfilmentOrigin.addressTownCity"
              class="form-control" id="addressTownCity">
          
            <label for="addressZipCode">Address Post Code</label>
            <input type="text" :class="{ 'is-invalid': formErrors.addressPostCode || cloudError === 'badPostalCode' }" 
              v-model="fulfilmentMethod.fulfilmentOrigin.addressPostCode"
              class="form-control" id="addressZipCode" oninput="this.value = this.value.toUpperCase()">
            <div v-if="cloudError === 'badPostalCode'" class="alert alert-danger mt-4" role="alert">
              Bad PostalCode
            </div>
          </div>
          <div class="form-group">
            <span style="display: flex; flex-direction: column; align-items:center;"> 
              <!-- ~ https://developers.google.com/maps/documentation/maps-static/start -->
              <!-- ~ https://developers.google.com/maps/documentation/maps-static/start#Markers -->
              <!-- NOTE markers=markerStyles|markerLocation1| markerLocation2|... etc. -->
              <img
                style="align-self: center;"
                v-if="fulfilmentMethod.fulfilmentOrigin && fulfilmentMethod.fulfilmentOrigin.latitude && fulfilmentMethod.fulfilmentOrigin.longitude" 
                :src="'https://maps.googleapis.com/maps/api/staticmap?size=800x400&key=' + googleApiKey + '&zoom=15&markers=size:mid|color:' + (fulfilmentMethod.fulfilmentOrigin.label === 'Store' ? 'green' : 'red') + '|label:' + fulfilmentMethod.fulfilmentOrigin.label.substring(0,1).toUpperCase() + '|' + fulfilmentMethod.fulfilmentOrigin.latitude + ',' + fulfilmentMethod.fulfilmentOrigin.longitude"/>
            <p>Latitude: {{fulfilmentMethod.fulfilmentOrigin.latitude}}, Longitude: {{fulfilmentMethod.fulfilmentOrigin.longitude}}</p>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="orderCutoff">Order Cutoff (on day prior)</label><br/>
          <input type="time" id="orderCutoff" v-model="fulfilmentMethod.orderCutoff">
        </div>
        <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
        <div v-if="cloudError === 'badInput'" class="alert alert-danger mt-4" role="alert">
          Check Address & other inputs are complete!
        </div>
    </ajax-form>
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
    convertToPounds: function (value) {
      if (!value) {
        return '£0';
      }
      value = '£' + (value / 100).toFixed(2);
      value = value.toString();
      return value;
    },
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    //…
  },
});
