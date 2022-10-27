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
	        this.user.deliveryPartnerRole
	      );
	      if(updateUserResponse.updatedUserId){
	        window.location.replace('/');
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
        location.replace('/');
      }
      this.syncing = false;
    },
    userManagesDeliveryPartner: async function () {},
  },
});
