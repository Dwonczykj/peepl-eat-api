/**
 * <edit-delivery-partner>
 * -----------------------------------------------------------------------------
 * Edit delivery partner component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('editDeliveryPartner', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'deliveryPartner',
  ],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      syncing: false,
      formRules: {
        email: {
          required: true
        },
        phoneNumber: {
          required: true
        }
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
    <div class="my-3 p-3 p-md-4 rounded action-card">
      <details>
        <summary class="action-card__summary">
          <span class="action-card__checkbox">
            <input type="checkbox">
          </span>
          <span>{{ deliveryPartner.name | capitalise }}</span>
        </summary>
        <div class="action-card__content">
          <ajax-form :cloud-error.sync="cloudError" :form-data="discount" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdDiscount" :action="(deliveryPartner.id) ?  'editDiscount' : 'createDiscount'">
            <div class="form-group mt-3">
              <label for="discountCode">Discount Code</label>
              <input :class="{ 'is-invalid': formErrors.code }" maxlength="50" minlength="3" style="text-transform: uppercase; max-width: 10em" v-model.trim="deliveryPartner.code" type="text" class="form-control" id="discountCode" required>
            </div>
            <div class="form-group">
              <label for="percentage">Percentage</label>
              <input :class="{ 'is-invalid': formErrors.percentage }" v-model="deliveryPartner.percentage" type="number" class="form-control" id="percentage" required>
            </div>
            <div class="form-group">
              <label for="maxUses">Max Uses (or 0 for no limit)</label>
              <input :class="{ 'is-invalid': formErrors.maxUses }" v-model="deliveryPartner.maxUses" type="number" class="form-control" id="maxUses" required>
            </div>
            <div class="form-group">
              <label for="expiryDateTime">End Date Time (or 0 for no limit)</label>
              <input :class="{ 'is-invalid': formErrors.expiryDateTime }" v-model="deliveryPartner.expiryDateTime" type="number" class="form-control" id="expiryDateTime" required>
            </div>
            <div class="form-group form-check">
              <input v-model="deliveryPartner.isEnabled" type="checkbox" class="form-check-input" id="enabled">
              <label :class="{ 'is-invalid': formErrors.isEnabled }" class="form-check-label" for="enabled">Is Enabled</label>
            </div>
  
            <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
            <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
              Discount not found.
            </div>
            <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
              There has been an error updating the deliveryPartner. Please try again.
            </div>
          </ajax-form>
        </div>
      </details>
    </div>`,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function(){
    //…
    this.deliveryPartner.vendor = this.vendorid;
  },
  beforeDestroy: function() {
    //…
  },

  filters: {
    convertToPounds: function (value) {
      if (!value) {return '£0';}
      value = '£' + (value/100).toFixed(2);
      value = value.toString();
      return value;
    },
    capitalise: function (value) {
      if (!value) {return ''; }
      value = value.toString();
      return value.toUpperCase();
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createdDiscount: function({id}){
      Vue.set(this.discount, 'id', id);
    },
  }
});
