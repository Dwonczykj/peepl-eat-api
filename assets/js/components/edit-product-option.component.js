/**
 * <edit-product-option>
 * -----------------------------------------------------------------------------
 * Edit product option component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('editProductOption', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'productOption',
    'productid'
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
      cloudError: ''
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
        {{ productOption.name }} <div class="text-muted ml-1">[{{productOption.values.length}} values]</div>
      </summary>
      <div class="action-card__content">
        <ajax-form :cloud-error.sync="cloudError" :form-data="productOption" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdProductOption" :action="(productOption.id) ?  'editProductOption' : 'createProductOption'">
          <div class="form-group mt-3">
            <label for="productOptionName">Name</label>
            <input type="text" class="form-control" v-model="productOption.name" id="productOptionName" required>
          </div>
          <ajax-button class="btn btn-peepl" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
          <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
            Product option not found.
          </div>
          <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
            There has been an error updating the product option. Please try again.
          </div>
        </ajax-form>

        <fieldset v-if="productOption.id">
          <h3 class="h6 mt-4">Values</h3>

          <edit-product-option-value :productoptionid="productOption.id" v-for="productOptionValue in productOption.values" :productOptionValue="productOptionValue">
          </edit-product-option-value>

          <div class="d-md-flex my-3 action-card-actions">
            <!--<select class="form-control form-control-sm mr-3" disabled>
              <option>Set as available</option>
              <option>Set as unavailable</option>
              <option>Delete</option>
            </select>
            <br/>
            <button class="btn btn-secondary btn-sm" disabled>Apply</button>-->
            <button @click="clickAddProductOptionValue" class="btn btn-peepl btn-sm ml-auto">Add a new value</button>
          </div>
        </fieldset>
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
    this.productOption.product = this.productid;
  },
  beforeDestroy: function() {
    //…
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    click: async function(){
      this.$emit('click');
    },
    createdProductOption: function({id}){
      Vue.set(this.productOption, 'id', id);
    },
    clickAddProductOptionValue: function(){
      var newProductOption = {
        name: '[Draft Option Value]',
        description: '',
        priceModifier: 0,
        isAvailable: false
      };

      this.productOption.values.push(newProductOption);
    }
  }
});
