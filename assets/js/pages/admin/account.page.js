import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md

parasails.registerPage('account', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formErrors: {},
    user: {
      email: '',
      name: '',
      password: '',
      phoneNoCountry: 0,
      phoneCountryCode: 1,
      role: '',
      vendorId: null,
      vendorRole: null,
      vendorConfirmed: null,
      deliveryPartnerId: null,
      deliveryPartnerRole: null,
    },
    email: '',
    name: '',
  },
  computed: {
    phoneNumber() {
      return `+${this.user.phoneCountryCode}${this.user.phoneNoCountry}`;
    },
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
    submittedAccountDetailsForm: async function () {
      this.syncing = true;
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
    parseAccountDetails: function () {},
    clickUpdateAccountDetails: async function () {
      try {
        const updateUserResponse = await Cloud.updateUser(
          this.user.email,
          this.user.name,
          this.user.role,
          this.user.password || '',
          this.user.vendorId,
          this.user.vendorRole,
          this.user.vendorConfirmed,
          this.user.deliveryPartnerId,
          this.user.deliveryPartnerRole,
          this.user.marketingEmailContactAllowed,
          this.user.marketingPhoneContactAllowed,
          this.user.marketingPushContactAllowed,
          this.user.marketingNotificationUtility
        );
        if (updateUserResponse.updatedUserId) {
          this.showToast('Product Category Update Succeeded', () => {
            window.location.replace('/');
          });
        }
      } catch (err) {
        this.syncing = false;
        if (err.exit === 'userExists') {
          this.cloudError = 'Unable to login. Check credentials.';
        } else if (err.code === 'firebaseErrored') {
          this.cloudError = `${err.message}`;
          // eslint-disable-next-line no-console
          console.warn(err.responseInfo);
        } else if (err.exit === 'error') {
          this.cloudError = `${err.message}`;
        } else if (err.exit === 'badRequest') {
          this.cloudError = `${err.message}`;
        } else if (err.exit === 'notFound') {
          this.cloudError = `${err.message}`;
        } else if (err.exit === 'unauthorised') {
          this.cloudError = `${err.message}`;
        } else {
          this.cloudError = `[${err.code}]: ${err.message}`;
          // eslint-disable-next-line no-console
          console.warn(err.responseInfo);
        }
      }

      if (!this.cloudError) {
        this.showToast('Product Category Update Succeeded', () => {
          window.location.replace('/');
        });
      }
      this.syncing = false;
    },
    userManagesDeliveryPartner: async function () {},
  },
});
