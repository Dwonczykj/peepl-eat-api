import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md
import * as _ from 'lodash';

declare var parasails: any;
declare var SAILS_LOCALS: any;
declare var Cloud: any;


parasails.registerPage('upload-products', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: '',
    formErrors: {},

    vendorId: -1,
    supplierName: '',
    uploadName: '',
    upload: null,

    formRules: {
      vendorId: {
        required: true,
        min: 1,
      },
      supplierName: {
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
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    changeFileInput: function (files) {
      try {
        this.syncing = true;
        if (files.length !== 1 && !this.upload) {
          const errStr =
            'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.';
          this.formErrors.upload = errStr;
          throw new Error(
            errStr
          );
        }
        var selectedFile = files[0];
  
        // If you cancel from the native upload window when you already
        // have a photo tracked, then we just avast (return early).
        // In this case, we just leave whatever you had there before.
        if (!selectedFile && this.upload) {
          return;
        }
  
        this.uploadName = selectedFile.name; // Used to show user which image is selected
        this.upload = selectedFile;
        this.formErrors.upload = '';
        this.syncing = false;
      } catch (error) {
        this.syncing = false;
        const errStr =
          `changeFileInput function errored: ${error}`;
        this.formErrors.upload = errStr;
        throw new Error(errStr);
      }

      // // Set up the file preview for the UI if using an image only:
      // var reader = new FileReader();
      // reader.onload = (event) => {
      //   this.previewImageSrc = event.target.result;

      //   // Unbind this "onload" event.
      //   delete reader.onload;
      // };
      // // Clear out any error messages about not providing an image.
      // reader.readAsDataURL(selectedFile);
    },
    csvUploadSubmitted: function (success: boolean) {
      if (success) {
        this.showToast(`Products uploaded`, () => {
          window.history.pushState({}, '', '/admin/vendors/' + this.vendorId);
        });
      }
    },
    prepareFormForUpload: function () {
      return {
        vendorId: this.vendorId,
        supplierName: this.supplierName,
        upload: this.upload,
      };
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
