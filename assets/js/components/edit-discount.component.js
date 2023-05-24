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
  props: ['discount', 'vendors'],
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
        value: {
          required: true,
        },
        currency: {
          required: true,
        },
        discountType: {
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
          <span :class="{'line-through': !discount.isEnabled }">{{ discount.code | capitalise }}</span> <div class="text-muted ml-1">[Used {{discount.timesUsed}} times, expires {{ timeToExpiry() }}, {{ printValue() }}]</div>
        </summary>
        <div class="action-card__content">
          <ajax-form :cloud-error.sync="cloudError" :form-data="discount" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdDiscount()" :action="(discount.id) ?  'editDiscount' : 'createDiscount'">
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
              <p class="mt-2 text-muted">{{discount.value | convertToPercent}}</p>
            </div>
            <div class="form-group" v-else-if="discount.discountType === 'fixed'">
              <label for="value">Fixed Value [{{discount.currency}}]</label>
              <input :class="{ 'is-invalid': formErrors.value }" v-model="discount.value" type="number" class="form-control" id="value" required>
              <p v-if="discount.currency === 'GBP'" class="mt-2 text-muted">{{discount.value | convertToPounds}}</p>
            </div>
            <div class="form-group">
              <label for="currency">Currency</label>
              <select class="form-control" id="currency" @change="currencyOnChange($event)" v-model="discount.currency">
                <option v-if="discount.discountType === 'fixed'" value="GBP">GBP</option>
                <!-- <option v-if="discount.discountType === 'fixed'" value="USD">USD</option> -->
                <!-- <option v-if="discount.discountType === 'fixed'" value="EUR">EUR</option> -->
                <option v-if="discount.discountType === 'fixed'" value="GBPx">GBPx</option>
                <option v-if="discount.discountType === 'fixed'" value="PPL">PPL</option>
                <!-- <option value="GBT">GBT</option> -->
                <option v-if="discount.discountType === 'percentage'" value="percent">%</option>
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
              <b-form-datepicker id="expiryDateTime" v-model="discount.expiryDateTime" class="mb-2"></b-form-datepicker>
            </div>
            <div class="form-group form-check">
              <input v-model="discount.isEnabled" type="checkbox" class="form-check-input" id="enabled">
              <label :class="{ 'is-invalid': formErrors.isEnabled }" class="form-check-label" for="enabled">Is Enabled</label>
            </div>
            <div class="form-group">
              <label for="vendor">Vendor</label>
              <select class="form-control" id="vendor" @change="vendorOnChange($event)" v-model="discount.vendor">
                <option v-if="discount.discountType === 'fixed'" v-for="vendor in vendors" :value="vendor.id">{{vendor.name}}</option>
              </select>
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
    // this.discount.vendor = this.vendorid;
    console.log(this.discount);
    if (this.discount.discountType === 'fixed') {
      document.getElementById('discountCode').classList.add('disabled');
      document.getElementById('discountCode').setAttribute('readonly', true);
      document.getElementById('maxUses').classList.add('disabled');
      document.getElementById('maxUses').setAttribute('readonly', true);
    } else if (this.discount.discountType === 'percentage') {
      // document.getElementById('currency').classList.add('disabled');
      // document.getElementById('currency').classList.add('hidden');
      document.getElementById('currency').setAttribute('readonly', true);
      this.discount.currency = 'percent';
    }
  },
  beforeDestroy: function () {
    //…
  },

  filters: {
    convertToPounds: function (value) {
      if (!value) {
        return '£0';
      }
      // value = '£' + (value / 100).toFixed(2);
      value = '£' + value.toFixed(2);
      value = value.toString();
      return value;
    },
    convertToPercent: function (value) {
      if (!value) {
        return '0%';
      }
      value = (value * 100).toFixed(2) + '%';
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
    createdDiscount: function (args) {
      if (args && args.id) {
        const id = args.id;
        Vue.set(this.discount, 'id', id);
        this.$parent.showToast &&
          this.$parent.showToast(`Discount edited [${id}]`, () => {
            // window.location.replace('/');
          });
      } else {
        this.$parent.showToast &&
          this.$parent.showToast('Discount created', () => {
            // window.location.replace('/');
          });
      }
    },
    timeToExpiry: function () {
      return this.$parent.timeToExpiry(this.discount);
    },
    toPoundsMethod: function (value) {
      if (!value) {
        return '£0';
      }
      // value = '£' + (value / 100).toFixed(2);
      value = '£' + value.toFixed(2);
      value = value.toString();
      return value;
    },
    printValue: function () {
      return this.discount.currency === 'GBP'
        ? this.toPoundsMethod(this.discount.value)
        : `${this.discount.value.toFixed(2)} ${this.discount.currency}`;
    },
    typeOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;
      if (newVal === 'percentage') {
        // this.discount.currency = 'GBPx';
        document.getElementById('discountCode').classList.remove('disabled');
        document.getElementById('discountCode').removeAttribute('readonly');
        document.getElementById('maxUses').classList.remove('disabled');
        document.getElementById('maxUses').removeAttribute('readonly');
        this.discount.code = '';
        document.getElementById('currency').setAttribute('readonly', true);
        this.discount.currency = 'percent';
      }
      if (newVal === 'fixed') {
        // this.discount.currency = 'GBPx';
        this.discount.code = this.$parent.createUuidv4();
        document.getElementById('discountCode').classList.add('disabled');
        document.getElementById('discountCode').setAttribute('readonly', true);
        this.discount.maxUses = 1;
        document.getElementById('maxUses').classList.add('disabled');
        document.getElementById('maxUses').setAttribute('readonly', true);
        document.getElementById('currency').removeAttribute('readonly', true);
        this.discount.currency = 'GBP';
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
    vendorOnChange: function (selectEvent) {
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
