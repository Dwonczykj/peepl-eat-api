/**
 * <edit-discount>
 * -----------------------------------------------------------------------------
 * Edit discount component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('editDiscount', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: ['discount'],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function () {
    return {
      syncing: false,
      formRules: {
        code: {
          required: true,
        },
        percentage: {
          required: true,
        },
      },
      formErrors: {},
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
          <span :class="{'line-through': !discount.isEnabled }">{{ discount.code | capitalise }}</span> <div class="text-muted ml-1">[Used {{discount.timesUsed}} times]</div>
        </summary>
        <div class="action-card__content">
          <ajax-form :cloud-error.sync="cloudError" :form-data="discount" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdDiscount" :action="(discount.id) ?  'editDiscount' : 'createDiscount'">
            <div class="form-group mt-3">
              <label for="discountCode">Discount Code</label>
              <input :class="{ 'is-invalid': formErrors.code }" maxlength="50" minlength="3" style="text-transform: uppercase; max-width: 10em" v-model.trim="discount.code" type="text" class="form-control" id="discountCode" required>
            </div>
            <div class="form-group">
              <label for="discountType">Discount Type</label>
              <select class="form-control" id="discountType" @change="typeOnChange($event)" v-model="discount.discountType">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div class="form-group" v-if="discount.discountType === 'percentage'">
              <label for="value">Percentage</label>
              <input :class="{ 'is-invalid': formErrors.value }" v-model="discount.value" type="number" class="form-control" id="value" required>
            </div>
            <div class="form-group" v-else-if="discount.discountType === 'fixed'">
              <label for="value">Fixed Value [{{discount.currency}}]</label>
              <input :class="{ 'is-invalid': formErrors.value }" v-model="discount.value" type="number" class="form-control" id="value" required>
            </div>
            <div class="form-group">
              <label for="currency">Currency</label>
              <select class="form-control" id="currency" @change="currencyOnChange($event)" v-model="discount.currency">
                <option value="GBP">GBP</option>
                <!-- <option value="USD">USD</option> -->
                <!-- <option value="EUR">EUR</option> -->
                <option value="GBPx">GBPx</option>
                <option value="PPL">PPL</option>
                <!-- <option value="GBT">GBT</option> -->
              </select>
              <!-- <input :class="{ 'is-invalid': formErrors.currency }" v-model="discount.currency" type="text" class="form-control" id="currency"> -->
            </div>
            <div class="form-group">
              <label for="linkedWalletAddress">Linked Wallet Address</label>
              <input :class="{ 'is-invalid': formErrors.linkedWalletAddress }" v-model="discount.linkedWalletAddress" type="text" class="form-control" id="linkedWalletAddress">
            </div>
            <div class="form-group">
              <label for="maxUses">Max Uses (or 0 for no limit)</label>
              <input :class="{ 'is-invalid': formErrors.maxUses }" v-model="discount.maxUses" type="number" class="form-control" id="maxUses" required>
            </div>
            <div class="form-group">
              <label for="expiryDateTime">End Date Time (or 0 for no limit)</label>
              <input :class="{ 'is-invalid': formErrors.expiryDateTime }" v-model="discount.expiryDateTime" type="number" class="form-control" id="expiryDateTime" required>
            </div>
            <div class="form-group form-check">
              <input v-model="discount.isEnabled" type="checkbox" class="form-check-input" id="enabled">
              <label :class="{ 'is-invalid': formErrors.isEnabled }" class="form-check-label" for="enabled">Is Enabled</label>
            </div>
  
            <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
            <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
              Discount not found.
            </div>
            <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
              There has been an error updating the discount. Please try again.
            </div>
          </ajax-form>
        </div>
      </details>
    </div>`,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
  },
  mounted: async function () {
    //…
    this.discount.vendor = this.vendorid;
  },
  beforeDestroy: function () {
    //…
  },

  filters: {
    convertToPounds: function (value) {
      if (!value) {
        return '£0';
      }
      value = '£' + (value / 100).toFixed(2);
      value = value.toString();
      return value;
    },
    capitalise: function (value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.toUpperCase();
    },
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createdDiscount: function ({ id }) {
      Vue.set(this.discount, 'id', id);
    },
    typeOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;

      if (newVal === 'percentage') {
        // this.discount.currency = 'GBPx';
      }
      if (newVal === 'fixed') {
        // this.discount.currency = 'GBPx';
      }
    },
    currencyOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;

      // if (newVal === 'deliveryPartner' && !this.isDeliveryPartner) {
      //   window.alert('isDeliveryPartner getter not working');
      // }
      // if (newVal === 'vendor' && !this.isVendor) {
      //   window.alert('isVendor getter not working');
      // }
    },
  },
});
