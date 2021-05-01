/**
 * <edit-product-option-value>
 * -----------------------------------------------------------------------------
 * Edit product option value component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('editProductOptionValue', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'productOptionValue',
    'productoptionid'
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
      }
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
        {{ productOptionValue.name }}
      </summary>
      <div class="action-card__content">
        <ajax-form :form-data="productOptionValue" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdProductOptionValue" :action="(productOptionValue.id) ?  'editProductOptionValue' : 'createProductOptionValue'">
          <div class="form-group mt-3">
            <label for="productOptionValueName">Name</label>
            <input type="text" v-model="productOptionValue.name" class="form-control" id="productOptionValueName" required>
          </div>
          <div class="form-group">
            <label for="optionValueDescription">Option Description</label>
            <textarea class="form-control" v-model="productOptionValue.description" id="optionValueDescription"></textarea>
          </div>
          <div class="form-group">
            <label for="optionValuePrice">Price modifier (in +/- pence)</label>
            <input type="text" v-model="productOptionValue.priceModifier" class="form-control" id="optionValuePrice" required>
            <p class="mt-2 text-muted">{{productOptionValue.priceModifier | convertToPounds}}</p>
          </div>
          <div class="form-group form-check">
            <input v-model="productOptionValue.isAvailable" type="checkbox" class="form-check-input" id="optionValueAvailable">
            <label class="form-check-label" for="optionValueAvailable">Is Available</label>
          </div>
          <ajax-button class="btn btn-peepl" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
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
    this.productOptionValue.productOption = this.productoptionid;
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
    click: async function(){
      this.$emit('click');
    },
    createdProductOptionValue: function({id}){
      Vue.set(this.productOptionValue, 'id', id);
    }
  }
});
