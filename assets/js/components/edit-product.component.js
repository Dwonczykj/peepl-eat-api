/**
 * <edit-product>
 * -----------------------------------------------------------------------------
 * Edit product component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('editProduct', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: [
    'product',
    'vendorid'
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
      imageName: 'Choose image'
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
        {{ product.name }}
      </summary>
      <div class="action-card__content">
        <ajax-form :form-data="product" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdProduct" :action="(product.id) ?  'editProduct' : 'createProduct'">
          <div class="form-group mt-3">
            <label for="productName">Product Name</label>
            <input v-model="product.name" type="text" class="form-control" id="productName" required>
          </div>
          <div class="form-group">
            <label for="productDescription">Product Description</label>
            <textarea v-model="product.description" class="form-control" id="productDescription" required></textarea>
          </div>
          <div class="form-group">
            <label for="basePrice">Base Price (in pence)</label>
            <input v-model="product.basePrice" type="text" class="form-control" id="basePrice" required>
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <input v-model="product.priority" type="number" class="form-control" id="priority" required>
          </div>
          <div class="form-group form-check">
            <input v-model="product.isAvailable" type="checkbox" class="form-check-input" id="available">
            <label class="form-check-label" for="available">Is Available</label>
          </div>
          <fieldset>
            <h2 class="h5 mt-3">Featured Image</h2>
            <img v-if="product.id && !product.image" :src="'/products/download-image/' + product.id" />
            <div class="custom-file">
              <input type="file" class="custom-file-input" accept="image/*" id="customFile" @change="changeProductImageInput($event.target.files)">
              <label class="custom-file-label" for="customFile">{{imageName}}</label>
            </div>
          </fieldset>

          <ajax-button class="btn btn-peepl mt-5" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
        </ajax-form>

        <fieldset v-if="product.id">
          <h3 class="h6 mt-4">Options</h3>

          <!-- TODO: loop through product options
          <%- // partial('../partials/admin-product-option.ejs') %>
          TODO: end loop -->

          <div class="d-md-flex my-3 action-card-actions">
            <select class="form-control form-control-sm mr-3" disabled>
              <option>Delete</option>
            </select>
            <button class="btn btn-secondary btn-sm" disabled>Apply</button>
            <button class="btn btn-peepl btn-sm ml-auto">Add a new option</button>
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
    //…
    this.product.vendor = this.vendorid;
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
    createdProduct: function({id}){
      Vue.set(this.product, 'id', id);
    },
    changeProductImageInput: function(files) {
      if (files.length !== 1 && !this.product.image) {
        throw new Error('Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.');
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.product.image) {
        return;
      }

      this.imageName = selectedFile.name; // Used to show user which image is selected
      this.product.image = selectedFile;
      this.formErrors.image = '';
    },
  }
});
