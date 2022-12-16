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
  props: ['product', 'productcategories', 'vendorid'],
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function () {
    return {
      syncing: false,
      formRules: {
        name: {
          required: true,
        },
      },
      previewImageSrc: '',
      formErrors: {},
      cloudError: '',
      imageName: 'Choose image',
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
        <span :class="{'line-through': !product.isAvailable }">
          {{ product.name }}
        </span>
      </summary>
      <div class="action-card__content">
        <ajax-form :cloud-error.sync="cloudError" :form-data="product" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdProduct" :action="(product.id) ?  'editProduct' : 'createProduct'">
          <div class="form-group mt-3">
            <label for="productName">Product Name</label>
            <input :class="{ 'is-invalid': formErrors.name }" v-model="product.name" type="text" class="form-control" id="productName" required>
          </div>
          <div class="form-group">
            <label for="productDescription">Product Description</label>
            <textarea :class="{ 'is-invalid': formErrors.description }" v-model="product.description" class="form-control" id="productDescription" required></textarea>
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select class="form-control" id="status" v-model="product.status" >
              <option value="inactive">Discontinued</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div class="form-group">
            <label for="category">Category</label>
            <select class="form-control" id="category" v-model="product.category" >
              <!-- TODO: Add image urls to dropdown  options as leading icon -->
              <option v-for="productCategory in productcategories" :value="productCategory.id">{{productCategory.name}}</option> 
            </select>
          </div>
          <div class="form-group">
            <label for="basePrice">Base Price (in pence)</label>
            <input :class="{ 'is-invalid': formErrors.basePrice }" v-model="product.basePrice" type="number" class="form-control" id="basePrice" required>
            <p class="mt-2 text-muted">{{product.basePrice | convertToPounds}}</p>
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <input :class="{ 'is-invalid': formErrors.priority }" v-model="product.priority" type="number" class="form-control" id="priority" required>
          </div>
          <div class="form-group form-check">
            <input v-model="product.isAvailable" type="checkbox" class="form-check-input" id="available">
            <label :class="{ 'is-invalid': formErrors.isAvailable }" class="form-check-label" for="available">Is Available</label>
          </div>
          <div class="form-group form-check">
            <input v-model="product.isFeatured" type="checkbox" class="form-check-input" id="featured">
            <label :class="{ 'is-invalid': formErrors.isFeatured }" class="form-check-label" for="featured">Is Featured</label>
          </div>
          <fieldset>
            <h2 class="h5 mt-3">Featured Image</h2>
            <img v-if="previewImageSrc || product.id" :src="(previewImageSrc) ? previewImageSrc : product.imageUrl" />
            <div class="custom-file">
              <input type="file" id="customFile" @change="changeProductImageInput($event.target.files)" :class="{ 'is-invalid': formErrors.image }" class="custom-file-input" accept="image/*">
              <!--<input type="text" id="imageUrlExplicitInput" @change="changeProductImageBackupUrl()" v-model="product.imageUrl" :class="{ 'is-invalid': formErrors.image }" class="form-control">-->
              <!--<label for="imageUrlExplicitInput">{{imageName}}</label>-->
              <label class="custom-file-label" for="customFile">{{imageName}}</label>
            </div>
          </fieldset>

          <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
          <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
            Product not found.
          </div>
          <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
            There has been an error updating the product. Please try again.
          </div>
        </ajax-form>

        <fieldset v-if="product.id">
          <h3 class="h6 mt-4">Options</h3>

          <edit-product-option :productid="product.id" v-for="productOption in product.options" :productOption="productOption">
          </edit-product-option>

          <div class="d-md-flex my-3 action-card-actions">
            <!--select class="form-control form-control-sm mr-3" disabled>
              <option>Delete</option>
            </select>
            <br/>
            <button class="btn btn-secondary btn-sm" disabled>Apply</button>-->
            <button class="btn btn-peepl btn-sm ml-auto" @click="clickAddProductOption">Add a new option</button>
          </div>
        </fieldset>
      </div>
    </details>
  </div>`,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
    if (!this.product.status) {
      this.product.status = 'active';
    }
  },
  mounted: async function () {
    //…
    this.product.vendor = this.vendorid;
    if (!this.product.options) {
      Vue.set(this.product, 'options', []);
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
      value = '£' + (value / 100).toFixed(2);
      value = value.toString();
      return value;
    },
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    click: async function () {
      this.$emit('click');
    },
    createdProduct: function ({ id }) {
      Vue.set(this.product, 'id', id);
      this.showToast('Product Update Succeeded');
    },
    changeProductImageBackupUrl: function () {
      if (this.product.imageUrl) {
        this.product.image = this.product.imageUrl;
      }
    },
    changeProductImageInput: function (files) {
      if (files.length !== 1 && !this.product.image) {
        throw new Error(
          'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.'
        );
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

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = (event) => {
        this.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      reader.readAsDataURL(selectedFile);
    },
    clickAddProductOption: function () {
      var newProductOption = {
        name: '[Draft Option]',
        values: [],
      };
      this.product.options.push(newProductOption);
    },
    showToast: function (message) {
      // const Toastify = require('toastify-js');
      // Toastify({
      //   text: message,
      //   duration: 3000,
      //   destination: './',
      //   newWindow: true,
      //   close: false,
      //   gravity: 'top', // `top` or `bottom`
      //   position: 'right', // `left`, `center` or `right`
      //   stopOnFocus: true, // Prevents dismissing of toast on hover
      //   style: {
      //     background: 'linear-gradient(to right, #00b09b, #96c93d)',
      //   },
      //   onClick: function () {}, // Callback after click
      // }).showToast();
    },
  },
});
