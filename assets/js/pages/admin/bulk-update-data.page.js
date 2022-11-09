import { isObject } from 'lodash-es';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md

parasails.registerPage('bulk-update-data', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formErrors: {},
    data: '',
    parsedData: [],
    modelType: 'ProductCategory',
    createOrUpdateMode: 'create',
  },
  computed: {},
  watch: {
    // https://vuejs.org/guide/essentials/watchers.html

    // whenever this.role changes, this function will run
    modelType(newVal, oldVal) {
      if (newVal !== oldVal) {
        // if (!this.isVendor) {
        //   document
        //     .getElementById('deliveryPartnerRoleContainer')
        //     .classList.remove('hidden');
        //   document
        //     .getElementById('vendorRoleContainer')
        //     .classList.add('hidden');
        // }
        // if (!this.isDeliveryPartner) {
        //   document
        //     .getElementById('deliveryPartnerRoleContainer')
        //     .classList.add('hidden');
        //   document
        //     .getElementById('vendorRoleContainer')
        //     .classList.remove('hidden');
        // }
        // document.getElementById('business').selectedIndex = -1;
        // document.getElementById('vendorRole').selectedIndex = -1;
        // document.getElementById('deliveryPartnerRole').selectedIndex = -1;
      }
    },
    // data(newVal, oldVal) {
    //   if(newVal !== oldVal){
    //     var textedJson = JSON.stringify(newVal, undefined, 2);
    //     this.data = textedJson;
    //   }
    // }
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    //…
  },
  mounted: async function () {
    _.extend(this, SAILS_LOCALS);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    // * display functions
    modelTypeOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;

      if (newVal === 'ProductCategory') {
        //ignore
      }
    },
    dataOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;

      const jsonStr = newVal;

      try {
        const json = JSON.parse(jsonStr);
        if (!isObject(json)) {
          this.formErrors.data =
            'Only accepts Array of JSON Objects, please wrap in []';
        } else if (!Array.isArray(json)) {
          this.formErrors.data = 'Invalid JSON';
        } else {
          this.formErrors.data = false;
        }
        this.parsedData = json;
      } catch (unusedErr) {
        this.formErrors.data = 'Invalid JSON';
      }
    },
    showToast: function (message) {
      Toastify({
        text: message,
        duration: 3000,
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
      }).showToast();
    },

    // * parse Function
    parseForm: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};
      const setFormErrors = {};

      const modelType = this.modelType;
      const createOrUpdateMode = this.createOrUpdateMode;
      const data = this.parsedData;

      if (!modelType) {
        setFormErrors.modelType = true;
      }
      if (!createOrUpdateMode) {
        setFormErrors.createOrUpdateMode = true;
      }
      if (!data) {
        setFormErrors.data = true;
      }

      this.formErrors = {
        ...this.formErrors,
        ...setFormErrors,
      };
      if (!this.formErrorsExist()) {
        return this.getSubmissionArgs();
      }
      return; // ! The result of this function is called from ajax-form._submit if handle-parsing prop set on the form in the ejs
    },
    getSubmissionArgs: function () {
      return {
        modelType: this.modelType,
        createOrUpdateMode: this.createOrUpdateMode,
        data: this.parsedData,
      };
    },
    cloudErrorsExist: function () {
      return this.cloudError || this.cloudCode;
    },
    formErrorsExist: function () {
      return (
        Object.values(this.formErrors).reduce(
          (prev, cur) => prev + Number(cur),
          0
        ) > 0 || this.cloudErrorsExist()
      );
    },

    // * Http Functions
    clickUploadData: async function () {
      try {
        this.syncing = true;
        const updateDataResponse = await Cloud.bulkUpdateData(
          this.modelType,
          this.parsedData,
          this.createOrUpdateMode
        );
        if (updateDataResponse.success) {
          window.location.replace('/');
          this.showToast('Bulk Upload Succeeded');
        } else {
          this.syncing = false;
          this.cloudError = `Unable to upload data: ${updateDataResponse.message}`;
          this.showToast('Bulk Upload Failed');
        }
      } catch (err) {
        this.syncing = false;
        this.showToast('Bulk Upload Failed');
        if (err.exit === 'notSupported') {
          this.cloudError = err.message;
          // } else if (err.code === 'firebaseErrored') {
          //   this.cloudError = `${err.message}`;
          //   // eslint-disable-next-line no-console
          //   console.warn(err.responseInfo);
          // } else if (err.exit === 'error') {
          //   this.cloudError = `${err.message}`;
          // } else if (err.exit === 'badRequest') {
          //   this.cloudError = `${err.message}`;
          // } else if (err.exit === 'notFound') {
          //   this.cloudError = `${err.message}`;
          // } else if (err.exit === 'unauthorised') {
          //   this.cloudError = `${err.message}`;
        } else {
          this.cloudError = `[${err.code}]: ${err.message}`;
        }
      }

      if (!this.cloudError) {
        location.replace('/');
      }
      this.syncing = false;
    },
    submittedBulkUpdateDataForm: async function () {
      this.syncing = true;
      if (!this.cloudError) {
        location.replace('/');
      }
      this.syncing = false;
    },
  },
});
