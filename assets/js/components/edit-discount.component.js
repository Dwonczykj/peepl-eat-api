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
  props: [
    'discount',
  ],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      syncing: false,
      formRules: {
        code: {
          required: true
        },
        percentage: {
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
          <span :class="{'line-through': !discount.isEnabled }">{{ discount.code }}</span>
        </summary>
        <div class="action-card__content">
          <ajax-form :cloud-error.sync="cloudError" :form-data="discount" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdDiscount" :action="(discount.id) ?  'editProduct' : 'createProduct'">
            <div class="form-group mt-3">
              <label for="discountCode">Discount Code</label>
              <input :class="{ 'is-invalid': formErrors.code }" maxlength="50" minlength="3" style="text-transform: uppercase; max-width: 10em" v-model.trim="discount.code" type="text" class="form-control" id="discountCode" required>
            </div>
            <div class="form-group">
              <label for="percentage">Percentage</label>
              <input :class="{ 'is-invalid': formErrors.percentage }" v-model="discount.percentage" type="number" class="form-control" id="percentage" required>
            </div>
            <div class="form-group">
              <label for="maxUses">Max Uses</label>
              <input :class="{ 'is-invalid': formErrors.maxUses }" v-model="discount.maxUses" type="number" class="form-control" id="maxUses" required>
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
  beforeMount: function() {
    //…
  },
  mounted: async function(){
    //…
    this.discount.vendor = this.vendorid;
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
