/**
 * <edit-product-category>
 * -----------------------------------------------------------------------------
 * Edit product component used in the admin panel.
 *
 * @type {Component}
 *
 * @event click   [emitted when clicked]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('editProductCategory', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  props: ['category', 'categorygroups', 'vendorid'],
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
        <span>{{ category.name || 'New Product Category'}}</span>
      </summary>
      <div class="action-card__content">
        <ajax-form :cloud-error.sync="cloudError" :form-data="category" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdProductCategory" :action="(category.id) ?  'editProductCategory' : 'createProductCategory'">
          <div class="form-group mt-3">
            <label for="productCategoryName">Product Category Name</label>
            <input :class="{ 'is-invalid': formErrors.name }" v-model="category.name" type="text" class="form-control" id="productCategoryName" required>
          </div>

          <div class="form-group">
            <label for="categoryGroup">Category Group</label>
            <select class="form-control" id="categoryGroup" v-model="category.categoryGroup" >
              <!-- TODO: Add image urls to dropdown  options as leading icon -->
              <option v-for="categoryGroup in categorygroups" :value="categoryGroup.id">{{categoryGroup.name}}</option>
            </select>
          </div>
          <div class="form-group hidden readonly" readonly>
            <select class="form-control" id="vendor" v-model="vendorid" >
              <option :value="vendorid">vendor</option>
            </select>
          </div>
          
          <fieldset>
            <h2 class="h5 mt-3">Featured Image</h2>
            <img v-if="previewImageSrc || category.id" :src="(previewImageSrc) ? previewImageSrc : category.imageUrl" />
            <div class="custom-file">
              <input :class="{ 'is-invalid': formErrors.image }" type="file" class="custom-file-input" accept="image/*" id="customFile" @change="changeProductImageInput($event.target.files)">
              <label class="custom-file-label" for="customFile">{{imageName}}</label>
            </div>
          </fieldset>

          <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
          <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
            Product Category not found.
          </div>
          <div v-else-if="cloudError === 'alreadyExists'" class="alert alert-danger mt-4" role="alert">
            A product category with this name already exists for this vendor
          </div>
          <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
            There has been an error updating the product. Please try again.
          </div>
        </ajax-form>
      </div>
    </details>
  </div>`,
  // template: `
  // <div class="my-3 p-3 p-md-4 rounded action-card">
  //   <details>
  //     <summary class="action-card__summary">
  //       <span>{{ category.name }}</span>
  //     </summary>
  //     <div class="action-card__content">
  //       <ajax-form :cloud-error.sync="cloudError" :form-data="category" :form-rules="formRules" :syncing.sync="syncing" :form-errors.sync="formErrors" @submitted="createdProductCategory" :action="(category.id) ?  'editProductCategory' : 'createProductCategory'">
  //         <div class="form-group mt-3">
  //           <label for="categoryName">Category Name</label>
  //           <input :class="{ 'is-invalid': formErrors.name }" v-model="category.name" type="text" class="form-control" id="categoryName" required>
  //         </div>

  //         <div class="form-group">
  //           <label for="categoryGroup">Category Group {{categorygroups.length}}</label>
  //           <select class="form-control" id="categoryGroup" v-model="category.categoryGroup" >
  //             <!-- TODO: Add image urls to dropdown  options as leading icon -->
  //             <option v-for="categoryGroup in categorygroups" :value="categoryGroup.id">{{categoryGroup.name}}</option>
  //           </select>
  //         </div>

  //         <!-- <fieldset>
  //           <h2 class="h5 mt-3">Featured Image</h2>
  //           <img v-if="previewImageSrc || category.id" :src="(previewImageSrc) ? previewImageSrc : category.imageUrl" />
  //           <div class="custom-file">
  //             <input :class="{ 'is-invalid': formErrors.image }" type="file" class="custom-file-input" accept="image/*" id="customFile" @change="changeProductImageInput($event.target.files)">
  //             <label class="custom-file-label" for="customFile">{{imageName}}</label>
  //           </div>
  //         </fieldset> -->

  //         <ajax-button class="btn btn-peepl mt-4" type="submit" :syncing="syncing" v-bind:class="{ 'is-loading': syncing }">Save changes</ajax-button>
  //         <div v-if="cloudError === 'notFound'" class="alert alert-danger mt-4" role="alert">
  //           Product Category not found.
  //         </div>
  //         <div v-else-if="cloudError" class="alert alert-danger mt-4" role="alert">
  //           There has been an error updating the product category. Please try again.
  //         </div>
  //       </ajax-form>
  //     </div>
  //   </details>
  // </div>`,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
  },
  mounted: async function () {
    //…
    this.category.vendor = this.vendorid;
    if (!this.category.options) {
      Vue.set(this.category, 'options', []);
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
    createdProductCategory: function ({ id }) {
      Vue.set(this.category, 'id', id);
      this.showToast('Product Category Update Succeeded');
    },
    changeProductImageInput: function (files) {
      if (files.length !== 1 && !this.category.image) {
        throw new Error(
          'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.'
        );
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.category.image) {
        return;
      }

      this.imageName = selectedFile.name; // Used to show user which image is selected
      this.category.image = selectedFile;
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
