import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md

parasails.registerPage('admin-edit-vendor', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    formErrors: {},
    imageName: 'Choose image',
    vendor: {
      name: '',
      description: '',
      image: '',
      type: 'shop',
      walletAddress: '0x',
      deliveryPartner: null,
      // deliveryRestrictionDetails: '',
      status: 'draft',
      isVegan: true,
      minimumOrderAmount: false,
      pickupAddress: {
        addressLineOne: '',
        addressLineTwo: '',
        addressTownCity: '',
        addressPostCode: '',
        addressCountryCode: '',
        latitude: 0.0,
        longitude: 0.0,
        label: 'Shop 1',
      },
      products: [],
      vendorCategories: [],
      productCategories: [],
      fulfilmentPostalDistricts: [],
      users: [],
    },
    categoryGroups: [],
    colFul: {},
    delFul: {},
    postalDistricts: [],
    previewImageSrc: '',
    formRules: {
      name: {
        required: true,
        maxLength: 50,
      },
      description: {
        maxLength: 400,
        required: true,
      },
      type: {},
      walletAddress: {
        required: true,
        maxLength: 100,
        regex: /^0x[a-fA-F0-9]{40}$/,
      },
      status: {},
    },
    fulfilmethod: 'col',
    deliveryPartners: [],
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {},
  mounted: async function () {
    _.extend(this, SAILS_LOCALS);
    this.vendor.image = '';
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
    changeVendorImageInput: function (files) {
      if (files.length !== 1 && !this.vendor.image) {
        throw new Error(
          'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.'
        );
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.vendor.image) {
        return;
      }

      this.imageName = selectedFile.name; // Used to show user which image is selected
      this.vendor.image = selectedFile;
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
    vendorSubmitted: function ({ id }) {
      if (id) {
        this.vendor.id = id;
        this.showToast(`Vendor Updated`, () => {
          window.history.pushState({}, '', '/admin/vendors/' + id);
        });
      }
    },
    showToast: function (message, cb) {
      Toastify({
        text: message,
        duration: 1000,
        destination: './',
        newWindow: true,
        close: false,
        gravity: 'top', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
        onClick: function () {}, // Callback after click
        callback: cb,
      }).showToast();
    },
    clickAddProduct: function () {
      var newProduct = {
        name: '[Draft]',
        description: '',
        basePrice: '',
        isAvailable: false,
        image: '',
        options: [],
        category: this.vendor.productCategories && this.vendor.productCategories.length ? this.vendor.productCategories[0] : {
          id: -1,
          name: '',
          imageUrl: '',
          vendor: this.vendor.id,
          categoryGroup: null,
          products: [],
        },
      };
      this.vendor.products.push(newProduct);
    },
    clickAddProductCategory: function () {
      var newCategory = {
        name: '',
        vendor: this.vendor.id,
        imageUrl: '',
        categoryGroup: '',
      };

      this.vendor.productCategories.push(newCategory);
    },
    updatePostalDistricts: function () {
      var postalDistricts = this.postalDistricts
        .filter((district) => district.checked)
        .map((a) => {
          return a.id;
        });
      return { districts: postalDistricts, vendorId: this.vendor.id };
    },
  },
});
