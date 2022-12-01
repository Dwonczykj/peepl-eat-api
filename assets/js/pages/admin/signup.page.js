// import { initializeApp } from 'firebase/app';
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

parasails.registerPage('signup', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formData: {
      email: '',
      phoneNumber: '',
      rememberMe: false,
      password: '',
    },
    formErrors: {},
    formRules: {
      phoneNumber: {
        required: true,
        regex: /^\+?\d{0,13}$/,
      },
      status: {},
    },
    countryCode: '44',
    preventNextIteration: false,
    phoneNoCountryNoFormat: '',
    phoneNoCountry: '', //TODO: remove this from commit APIKEY
    // phoneNumber: '+1 234-566-9420',
    email: '',
    password: '',
    name: '',
    business: '',
    businessId: -1,
    role: 'consumer',
    vendorRole: 'none',
    deliveryPartnerRole: 'none',
    options: {
      role: ['admin', 'vendor', 'deliveryPartner', 'consumer'],
      vendorRole: ['owner', 'inventoryManager', 'salesManager', 'none'],
      deliveryPartnerRole: ['owner', 'deliveryManager', 'rider', 'none'],
    },
    vendors: [],
    deliveryPartners: [],
  },
  computed: {
    // * Getter -> a computed getter so that computed each time we access it
    filteredBusinesses() {
      if (this.isDeliveryPartner) {
        return this.deliveryPartners;
      } else if (this.isVendor) {
        return this.vendors;
      }
      return [...this.vendors, ...this.deliveryPartners];
    },
    filteredVendorRoles() {
      // `this` points to the component instance
      if (this.isVendor) {
        return this.options.vendorRole.filter((t) => t !== 'owner');
      } else if (this.isDeliveryPartner) {
        return [];
      }
      return [];
    },
    filteredDeliveryPartnerRoles() {
      // `this` points to the component instance
      if (this.isVendor) {
        return [];
      } else if (this.isDeliveryPartner) {
        return this.options.deliveryPartnerRole.filter((t) => t !== 'owner');
      }
      return [];
    },
    isDeliveryPartner() {
      return this.role === 'deliveryPartner';
    },
    isVendor() {
      return this.role === 'vendor';
    },
    isConsumer() {
      return this.role === 'consumer';
    },
    phoneNumber() {
      return `+${this.countryCode} ${this.phoneNoCountry}`;
    },
    phoneNumberFormatted() {
      var x = this.phoneNoCountryNoFormat;
      x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
      x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
      return `+${this.countryCode}${x}`;
    },
  },
  watch: {
    // https://vuejs.org/guide/essentials/watchers.html

    // whenever this.role changes, this function will run
    role(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!this.isVendor) {
          document
            .getElementById('deliveryPartnerRoleContainer')
            .classList.remove('hidden');
          document
            .getElementById('vendorRoleContainer')
            .classList.add('hidden');
        }
        if (!this.isDeliveryPartner) {
          document
            .getElementById('deliveryPartnerRoleContainer')
            .classList.add('hidden');
          document
            .getElementById('vendorRoleContainer')
            .classList.remove('hidden');
        }

        document.getElementById('business').selectedIndex = -1;
        document.getElementById('vendorRole').selectedIndex = -1;
        document.getElementById('deliveryPartnerRole').selectedIndex = -1;
      }
    },
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function () {
    // this.$focus('[autofocus]');
  },
  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    phoneNumberFocusOut: function (event) {
      if (['Arrow', 'Backspace', 'Shift'].includes(event.key)) {
        this.preventNextIteration = true;
        return;
      }
      if (this.preventNextIteration) {
        this.preventNextIteration = false;
        return;
      }
      this.phoneNoCountryNoFormat = this.phoneNoCountry.match(/\d/g)
        ? this.phoneNoCountry.replace(/-/g, '').match(/([1-9]\d{0,9})/g)[0]
        : '';

      // Format display value based on calculated currencyValue
      this.phoneNoCountry = this.phoneNoCountryNoFormat
        ? this.phoneNoCountryNoFormat.replace(
          /(\d{1,3})(\d{1,3})(\d{1,4})/g,
          '$1-$2-$3'
        )
        : '';
    },
    // countryCodeChange: function (event) {
    //   // const newVal = event.srcElement.value;
    // },
    roleOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;

      if (newVal === 'deliveryPartner' && !this.isDeliveryPartner) {
        window.alert('isDeliveryPartner getter not working');
      }
      if (newVal === 'vendor' && !this.isVendor) {
        window.alert('isVendor getter not working');
      }
    },
    getSubmissionArgs: function () {
      const phoneNoCountry = Number.parseInt(
          this.phoneNoCountry.trim().replace(/[^0-9]/g, '') || 0
      );
      const phoneCountryCode = Number.parseInt(
          this.countryCode.trim().replace(/[^0-9]/g, '') || 0
      );
      return {
        phoneNoCountry: phoneNoCountry,
        phoneCountryCode: phoneCountryCode,
        phoneNumber: `+${phoneCountryCode} ${phoneNoCountry}`,
        phoneNumberRaw: this.phoneNumberFormatted,
        email: this.email.toString().trim(),
        password: this.password.toString().trim(),
        name: this.name.toString().trim(),
        vendor: this.isVendor ? this.businessId : null,
        deliveryPartner: this.isDeliveryPartner ? this.businessId : null,
        role: this.role,
        vendorRole: this.vendorRole ?? 'none',
        deliveryPartnerRole: this.deliveryPartnerRole ?? 'none',
      };
    },
    formErrorsExist: function() {
      return (
        Object.values(this.formErrors).reduce(
          (prev, cur) => prev + Number(cur),
          0
        ) > 0 || this.cloudErrorsExist()
      );
    },
    cloudErrorsExist: function() {
      return this.cloudError || this.cloudCode;
    },
    parseRegistrationForm: function () {
      // clear existing errors
      this.formErrors = {};
      const setFormErrors = {};
      var argins = this.getSubmissionArgs();

      const countryCodeLength = argins.phoneCountryCode.toString().length;
      const numberTrailingLength = 6 - countryCodeLength;

      const firebasePhoneRegex = new RegExp(
        `^\\+\\d{${countryCodeLength}}\\d{3}-\\d{3}-\\d{${numberTrailingLength}}$`
      );

      if (!this.phoneNumberFormatted.match(firebasePhoneRegex)) {
        setFormErrors.phoneNumber = true;
      }

      // Validate email:
      if (!(argins.email && parasails.util.isValidEmailAddress(argins.email))) {
        setFormErrors.email = true;
      }

      // Validate name:
      if (!argins.name) {
        setFormErrors.name = true;
      }

      // Validate password:
      if (!argins.password) {
        setFormErrors.password = true;
      }

      this.formErrors = {
        ...this.formErrors,
        ...setFormErrors,
      };
      if(!this.formErrorsExist()){
        return this.getSubmissionArgs();
      }
      return; // ! The result of this function is called from ajax-form._submit if handle-parsing prop set on the form in the ejs
      // if (Object.keys(setFormErrors).length > 0) {
      //   return undefined;
      // } else {
      //   return setFormErrors;
      //   // formErrors set, so return undefined in case we are submitting the argins to the submission handler and want to stop the submission
      // }
    },
    clickRegisterUserWithEmailPassword: async function () {
      this.parseRegistrationForm();
      if (
        this.formErrorsExist()
      ) {
        return;
      }
      var argins = this.getSubmissionArgs();

      try {
        this.syncing = true;
        var _vegiSignUpResponse;
        try {
          _vegiSignUpResponse = await Cloud.signupWithPassword(
            argins['email'],
            argins['password'],
            argins['phoneNoCountry'],
            argins['phoneCountryCode'],
            argins['name'],
            argins['vendor'],
            argins['deliveryPartner'],
            argins['role'],
            argins['vendorRole'],
            argins['deliveryPartnerRole']
          );
        } catch (err) {
          if (err.exit === 'firebaseUserExistsForPhone') {
            this.cloudError =
              'User exists for this phone number. Please login.';
          } else if (err.exit === 'firebaseUserExistsForEmail') {
            this.cloudError = 'User exists for this email. Please login.';
          } else if (err.code === 'firebaseErrored') {
            this.cloudError = `FB: ${err.message}`;
            // eslint-disable-next-line no-console
            console.warn(err.responseInfo);
          } else {
            console.error(
              `Unable to signup to vegi server using firebase session token: ${err}`
            );
            this.cloudError = `[${err.code}]: ${err.message}`;
            // eslint-disable-next-line no-console
            console.warn(err.responseInfo);
          }
          this.syncing = false;
          return;
        }

        this.syncing = false;

        if (!_vegiSignUpResponse || _vegiSignUpResponse.status) {
          this.formErrors.phoneNumber = true;
          this.formErrors.email = true;
          this.formErrors.password = true;
          this.formErrors.name = true;
          this.formErrors.business = true;
        }
        return;
        // return this.submittedEmailPasswordRegistrationForm();
      } catch (err) {
        this.cloudError = `vegi service: ${err.message}`;
        this.syncing = false;
        if (err.message === 'userExists') {
          return;
        }
        console.warn(err);
      }
    },
    clickRegisterUserWithPhone: async function () {
      this.parseRegistrationForm();
      if (
        Object.values(this.formErrors).reduce(
          (prev, cur) => prev + Number(cur),
          0
        ) > 0
      ) {
        return;
      }

      // var argins = {
      //   phoneNoCountry: Number.parseInt(
      //     this.phoneNoCountry.trim().replace(/[^0-9]/g, '') || 0
      //   ),
      //   phoneCountryCode: Number.parseInt(
      //     this.countryCode.trim().replace(/[^0-9]/g, '') || 0
      //   ),
      //   email: this.email.toString().trim(),
      //   name: this.name.toString().trim(),
      //   vendor: this.isVendor ? this.businessId : null,
      //   deliveryPartner: this.isDeliveryPartner ? this.businessId : null,
      //   role: this.role,
      //   vendorRole: this.vendorRole ? 'none' : this.vendorRole,
      //   deliveryPartnerRole: this.deliveryPartnerRole
      //     ? 'none'
      //     : this.deliveryPartnerRole,
      // };

      const argins = this.getSubmissionArgs();

      try {
        this.syncing = true;
        var _vegiSignUpResponse;
        try {
          _vegiSignUpResponse = await Cloud.signup(
            argins['email'],
            argins['phoneNoCountry'],
            argins['phoneCountryCode'],
            argins['name'],
            argins['vendor'],
            argins['deliveryPartner'],
            argins['role'],
            argins['vendorRole'],
            argins['deliveryPartnerRole']
          );
        } catch (err) {
          if (err.exit === 'firebaseUserExistsForPhone') {
            this.cloudError =
              'User exists for this phone number. Please login.';
          } else if (err.exit === 'firebaseUserExistsForEmail') {
            this.cloudError = 'User exists for this email. Please login.';
          } else if (err.code === 'firebaseErrored') {
            this.cloudError = `${err.message}`;
            // eslint-disable-next-line no-console
            console.warn(err.responseInfo);
          } else {
            console.error(
              `Unable to signup to vegi server using firebase session token: ${err}`
            );
            this.cloudError = `[${err.code}]: ${err.message}`;
            // eslint-disable-next-line no-console
            console.warn(err.responseInfo);
          }
          this.syncing = false;
          return;
        }

        if (_vegiSignUpResponse.status || !_vegiSignUpResponse.data) {
          this.formErrors.phoneNumber = true;
          this.formErrors.countryCode = true;
          this.formErrors.business = true;
        }

        return;
      } catch (err) {
        // err has ['name', 'responseInfo', 'exit', 'code']
        // err.responseInfo contains the body, headers, code etc
        this.cloudError = err.message;

        if (err.exit === 'userExists') {
          this.cloudError =
            'Unable to register. A user already exists for these credentials.';
        }
      }
    },
    submittedRegistrationForm: function () {
      this.syncing = true;
      if (!this.formErrorsExist()) {
        return this.toLoginWithEmail();
      }
      this.syncing = false;
    },
    submittedEmailPasswordRegistrationForm: function () {
      this.syncing = true;
      if(!this.formErrorsExist()){
        return this.toLoginWithEmail();
      }
      this.syncing = false;
    },
    hideSignupWithPassword: function () {
      document.getElementById('signupWithPhoneButton').classList.add('hidden');
      document
        .getElementById('signupWithPasswordButton')
        .classList.remove('hidden');
      document
        .getElementById('registrationPhoneContainer')
        .classList.remove('hidden');
      document
        .getElementById('registrationEmailPasswordContainer')
        .classList.add('hidden');
    },
    hideSignupWithPhone: function () {
      document
        .getElementById('signupWithPhoneButton')
        .classList.remove('hidden');
      document
        .getElementById('signupWithPasswordButton')
        .classList.add('hidden');
      document
        .getElementById('registrationPhoneContainer')
        .classList.add('hidden');
      document
        .getElementById('registrationEmailPasswordContainer')
        .classList.remove('hidden');
    },

    // * Navigation functions
    toLoginWithEmail: function () {
      window.location.replace('/admin/login-with-password');
    },
    toLoginWithPhone: function () {
      window.location.replace('/admin/login');
    },
  },
});
