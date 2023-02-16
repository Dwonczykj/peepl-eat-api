import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md

parasails.registerPage('admin-product-suggestion', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    formErrors: {},
    imageName: 'Product Suggestion Image',
    productSuggestion: {
      name: '',
      store: '',
      imageUrls: [],
      qrCode: '',
      additionalInformation: '',
    },
    previewImageSrc: '',
    formRules: {
      name: {
        required: true,
        maxLength: 50,
      },
      qrCode: {
        required: true,
        maxLength: 50,
      },
      additionalInformation: {
        // maxLength: 400,
        required: true,
      },
      store: {
        required: true,
        maxLength: 150,
      },
    },
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {},
  mounted: async function () {
    _.extend(this, SAILS_LOCALS);
    // this.vendor.image = '';
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
    productSuggestionUpdateSubmitted: function ({ id }) {
      if (id) {
        this.productSuggestion.id = id;
        this.showToast(`Product Suggestion Updated`, () => {
          window.history.pushState({}, '', '/admin/product-suggestions/');
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
  },
});
