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
      emailAddress: '',
      phoneNumber: '',
      rememberMe: false,
      password: '',
    },
    formErrors: {
    },
    formRules: {
      phoneNumber: {
        required: true,
        regex: /^\+?\d{0,13}$/
      },
      status: {
      }
    },
    countryCode: '1',
    preventNextIteration: false,
    phoneNoCountryNoFormat: '2345669420',
    phoneNoCountry: '234-566-9420', //TODO: remove this from commit APIKEY
    // phoneNumber: '+1 234-566-9420', 
    email: '',
    password: '',
    name: '',
    business: '',
    role: 'vendor',
    vendorRole: 'salesManager',
    courierRole: '',
    options: {
      role: [
        'admin',
        'vendor',
        'courier'
      ],
      vendorRole: [
        'owner',
        'inventoryManager',
        'salesManager'
      ],
      courierRole: [
        'owner',
        'deliveryManager',
        'rider'
      ]
    },
    vendors: [],
    couriers: []
  },
  computed: {
    // * Getter -> a computed getter so that computed each time we access it
    filteredBusinesses() {
      if (this.isCourier) {
        return this.couriers;
      }
      else if (this.isVendor) {
        return this.vendors;
      }
      return [
        ...this.vendors,
        ...this.couriers
      ];
    },
    filteredVendorRoles() {
      // `this` points to the component instance
      if (this.isVendor) {
        return this.options.vendorRole.filter(t => t !== 'owner');
      } else if (this.isCourier) {
        return [];
      }
      return [];
    },
    filteredCourierRoles() {
      // `this` points to the component instance
      if (this.isVendor) {
        return [];
      } else if (this.isCourier) {
        return this.options.courierRole.filter(t => t !== 'owner');
      }
      return [];
    },
    isCourier() {
      return this.role === 'courier';
    },
    isVendor() {
      return this.role === 'vendor';
    },
    phoneNumber() {
      return `+${this.countryCode} ${this.phoneNoCountry}`;
    },
    phoneNumberFormatted() {
      var x = this.phoneNoCountryNoFormat;
      x = x.replace(/-/g, '').match(/(\d{1,10})/g)[0];
      x = x.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
      return `+${this.countryCode} ${x}`;
    },
  },
  watch: {
    // https://vuejs.org/guide/essentials/watchers.html

    // whenever this.role changes, this function will run
    role(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (!this.isVendor) {
          document.getElementById('courierRoleContainer').classList.remove('hidden');
          document.getElementById('vendorRoleContainer').classList.add('hidden');
        }
        if (!this.isCourier) {
          document.getElementById('courierRoleContainer').classList.add('hidden');
          document.getElementById('vendorRoleContainer').classList.remove('hidden');
        }

        document.getElementById('business').selectedIndex = -1;
        document.getElementById('vendorRole').selectedIndex = -1;
        document.getElementById('courierRole').selectedIndex = -1;
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
      this.phoneNoCountryNoFormat = this.phoneNoCountry.replace(/-/g, '').match(/(\d{1,10})/g)[0];

      // Format display value based on calculated currencyValue
      this.phoneNoCountry = this.phoneNoCountryNoFormat.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
    },
    // countryCodeChange: function (event) {
    //   // const newVal = event.srcElement.value;
    // },
    roleOnChange: function (selectEvent) {
      const newVal = selectEvent.srcElement.value;

      if (newVal === 'courier' && !this.isCourier) {
        window.alert('isCourier getter not working');
      }
      if (newVal === 'vendor' && !this.isVendor) {
        window.alert('isVendor getter not working');
      }
    },
    parseRegistrationForm: function () {
      // clear existing errors
      this.formErrors = {};

      // var argins = {
      //   'phoneNumber': document.getElementById('phoneNumber').value.toString().trim(),
      //   'email': document.getElementById('email').value.toString().trim(),
      //   'name': document.getElementById('name').value.toString().trim(),
      //   'vendor': document.getElementById('business').options[document.getElementById('business').selectedIndex].value,
      //   'role': document.getElementById('role').options[document.getElementById('role').selectedIndex].value,
      //   'vendorRole': document.getElementById('vendorRole').options[document.getElementById('vendorRole').selectedIndex].value,
      //   'courierRole': document.getElementById('courierRole').options[document.getElementById('courierRole').selectedIndex].value,
      // };
      var argins = {
        'phoneNumber': this.phoneNumber,
        'email': this.email.toString().trim(),
        'name': this.name.toString().trim(),
        'vendor': this.isVendor ? this.business : null,
        'courier': this.isCourier ? this.business : null,
        'role': this.role,
        'vendorRole': this.vendorRole,
        'courierRole': this.courierRole,
      };

      const firebasePhoneRegex = /^\+\d{1,2} \d{3}-\d{3}-\d{4}$/;

      if (argins['phoneNumber'].match(firebasePhoneRegex)) {
        // this.phoneNumber = argins['phoneNumber'];
      } else {
        this.formErrors.phoneNumber = true;
        // throw new Error('badPhoneNumberFormat');
      }

      // Validate email:
      if (!(argins.emailAddress && parasails.util.isValidEmailAddress(argins['email']))) {
        this.formErrors.emailAddress = true;
      }

      // Validate name:
      if (!argins.name) {
        this.formErrors.emailAddress = true;
      }

      if (Object.keys(argins).length > 0) {
        // formErrors set, so return undefined in case we are submitting the argins to the submission handler and want to stop the submission
        return undefined;
      } else {
        return argins;
      }

    },
    clickRegisterUserWithEmailPassword: async function () {



      // argins = {
      //   'phoneNumber': document.getElementById('phoneNumber').value.toString().trim(),
      //   'email': document.getElementById('email').value.toString().trim(),
      //   'name': document.getElementById('name').value.toString().trim(),
      //   'role': document.getElementById('role').options[document.getElementById('role').selectedIndex].value,
      //   'vendorId': this.isVendor ? document.getElementById('business').options[document.getElementById('business').selectedIndex].value : '',
      //   'courierId': this.isCourier ? document.getElementById('business').options[document.getElementById('business').selectedIndex].value : '',
      //   'vendorRole': document.getElementById('vendorRole').options[document.getElementById('vendorRole').selectedIndex].value,
      //   'courierRole': document.getElementById('courierRole').options[document.getElementById('courierRole').selectedIndex].value,
      // };

      var argins = {
        'phoneNoCountry': Number.parseInt(this.phoneNoCountry.trim().replace(/[^0-9]/g, '')),
        'phoneCountryCode': Number.parseInt(this.countryCode.trim().replace(/[^0-9]/g, '')),
        'email': this.email.toString().trim(),
        'password': this.password.toString().trim(),
        'name': this.name.toString().trim(),
        'vendor': this.isVendor ? this.business : null,
        'courier': this.isCourier ? this.business : null,
        'role': this.role,
        'vendorRole': this.vendorRole,
        'courierRole': this.courierRole,
      };

      try {
        this.syncing = true;
        const response = await Cloud.signupWithPassword(
          argins['email'],
          argins['password'],
          argins['phoneNoCountry'],
          argins['phoneCountryCode'],
          argins['name'],
          argins['vendor'],
          argins['courier'],
          argins['role'],
          argins['vendorRole'],
          argins['courierRole'],
        );

        if (response.status) {
          this.formErrors.email = true;
          this.formErrors.password = true;
        }

        return this.submittedEmailPasswordRegistrationForm();

      } catch (err) {
        this.cloudError = err.message;
        if (err.message === 'userExists') {
          return;
        }
      }
    },
    clickRegisterUserWithPhone: async function () {
      // argins = {
      //   'phoneNumber': document.getElementById('phoneNumber').value.toString().trim(),
      //   'email': document.getElementById('email').value.toString().trim(),
      //   'name': document.getElementById('name').value.toString().trim(),
      //   'role': document.getElementById('role').options[document.getElementById('role').selectedIndex].value,
      //   'vendorId': this.isVendor ? document.getElementById('business').options[document.getElementById('business').selectedIndex].value : '',
      //   'courierId': this.isCourier ? document.getElementById('business').options[document.getElementById('business').selectedIndex].value : '',
      //   'vendorRole': document.getElementById('vendorRole').options[document.getElementById('vendorRole').selectedIndex].value,
      //   'courierRole': document.getElementById('courierRole').options[document.getElementById('courierRole').selectedIndex].value,
      // };

      var argins = {
        'phoneNoCountry': Number.parseInt(this.phoneNoCountry.trim().replace(/[^0-9]/g, '')),
        'phoneCountryCode': Number.parseInt(this.countryCode.trim().replace(/[^0-9]/g, '')),
        'email': this.email.toString().trim(),
        'name': this.name.toString().trim(),
        'vendor': this.isVendor ? this.business : null,
        'courier': this.isCourier ? this.business : null,
        'role': this.role,
        'vendorRole': this.vendorRole,
        'courierRole': this.courierRole,
      };

      try {
        this.syncing = true;
        const response = await Cloud.signup(
          argins['email'],
          argins['phoneNoCountry'],
          argins['phoneCountryCode'],
          argins['name'],
          argins['vendor'],
          argins['courier'],
          argins['role'],
          argins['vendorRole'],
          argins['courierRole'],
        );

        if (response.status) {
          this.formErrors.phoneNumber = true;
          this.formErrors.countryCode = true;
        }

        return this.submittedRegistrationForm();

      } catch (err) {
        this.cloudError = err.message;
        if (err.message === 'userExists') {
          return;
        }
      }
    },
    submittedRegistrationForm: function () {
      this.syncing = true;
      location.replace('./admin/login');
    },
    submittedEmailPasswordRegistrationForm: function () {
      this.syncing = true;
      location.replace('./admin/login-with-password');
    },
    hideSignupWithPassword: function () {
      document.getElementById('signupWithPhoneButton').classList.remove('hidden');
      document.getElementById('signupWithPasswordButton').classList.add('hidden');
      document.getElementById('registrationForm').classList.remove('hidden');
      document.getElementById('registrationEmailPasswordForm').classList.add('hidden');
    },
    hideSignupWithPhone: function () {
      document.getElementById('signupWithPhoneButton').classList.add('hidden');
      document.getElementById('signupWithPasswordButton').classList.remove('hidden');
      document.getElementById('registrationForm').classList.add('hidden');
      document.getElementById('registrationEmailPasswordForm').classList.remove('hidden');
    },
  }
});
