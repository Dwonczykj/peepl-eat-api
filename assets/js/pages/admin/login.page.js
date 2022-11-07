import { initializeApp } from 'firebase/app';
import {
  browserSessionPersistence, connectAuthEmulator, getAuth,
  RecaptchaVerifier,
  setPersistence,
  signInWithPhoneNumber
} from 'firebase/auth';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md

parasails.registerPage('login', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formErrors: {},
    countryCode: '44',
    phoneNoCountry: '',
    preventNextIteration: false,
    verificationCode: '',
    viewVerifyCodeForm: false,
    rememberMe: false,
    _hideRecaptcha: false,
  },
  computed: {
    // * Getter -> a computed getter so that computed each time we access it
    phoneNumber() {
      return `+${this.countryCode} ${this.phoneNoCountry}`;
    },
    phoneNoCountryNoFormat() {
      return this.phoneNoCountry.replace(/-/g, '').match(/(\d{1,10})/g)[0];
    },
    phoneNoCountryFormatted() {
      // Format display value based on calculated currencyValue
      return this.phoneNoCountryNoFormat.replace(
        /(\d{1,3})(\d{1,3})(\d{1,4})/g,
        '$1-$2-$3'
      );
    },
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function () {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function () {
    const config = {
      apiKey: window.SAILS_LOCALS.firebaseAPIKey, //! apiKey is fine: See: https://firebase.google.com/docs/projects/api-keys
      authDomain: 'vegiliverpool.firebaseapp.com',
      projectId: 'vegiliverpool',
      storageBucket: 'vegiliverpool.appspot.com',
      messagingSenderId: '526129377',
      appId: '1:526129377:web:a0e4d54396cbdebe70bfa0',
      measurementId: 'G-YZCWVWRNKN',
    };
    initializeApp(config);
    const auth = getAuth();
    if (window.SAILS_LOCALS.useEmulator) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    }
    // this.createRecaptcha();

    // this.$focus('[autofocus]');
  },

  // exits: {
  //   badPhoneNumberFormat: {
  //     description: 'Please ensure number is of format: "+ 1 234-567-8910"'
  //   },
  //   badVerificationCode: {
  //     description: 'Please ensure verification code is 6 digits: "123456"'
  //   },
  // },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    createRecaptcha: function () {
      const auth = getAuth();
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'normal',
          callback: (unusedResponse) => {
            // window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
            //unhide phone number form
            this.viewForm = 'numberForm';
            document.getElementById('numberForm').classList.remove('hidden');
            return this.clickVerifyPhoneNumber();
          },
          'expired-callback': () => {
            window.alert('recatcha expired!');
          },
        },
        auth
      );

      var elements = document.querySelectorAll('[role="alert"]');
      for (var el in elements) {
        if (el && el.classList) {
          el.classList.remove('hidden');
        }
      }
    },
    loadFirstCaptchaUser: async function () {
      this.syncing = true;

      if (!window.recaptchaVerifier) {
        this.createRecaptcha();
      }

      try {
        if (this.phoneNumber && Object.keys(this.formErrors).length < 1) {
          document
            .getElementById('recaptcha-container')
            .classList.remove('hidden');
          return window.recaptchaVerifier.render().then((unusedWidgetId) => {
            this.syncing = false;
            // document.getElementById('register').classList.add('hidden');
            // document.getElementById('start-recaptcha').classList.add('hidden');
            document
              .getElementById('login-button-container')
              .classList.add('hidden');
            if (this._hideRecaptcha) {
              return this.clickVerifyPhoneNumber();
            } else {
              return;
            }
          });
        }
      } catch (unusedErr) {
        this.syncing = false;
        return undefined;
      }
      this.syncing = false;
      return undefined;
    },

    // * login handles
    clickVerifyPhoneNumber: async function () {
      const phoneNumber = this.phoneNumber;
      const appVerifier = window.recaptchaVerifier;

      document.getElementById('verificationCode').focus();
      document.getElementById('recaptcha-container').classList.add('hidden');
      // document.getElementById('recaptcha-container').classList.remove('hidden');

      const userExists = await Cloud.userExistsForPhone(
        this.countryCode,
        this.phoneNoCountryNoFormat
      );
      if (!userExists) {
        this.syncing = false;
        this.formErrors.phoneNumber = true;
        this.formErrors.countryCode = true;
        this.cloudError = 'userNotFound';
        return;
      }

      const auth = getAuth();
      var _signInToFirebase = () => {
        return signInWithPhoneNumber(auth, phoneNumber, appVerifier)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            
            document.getElementById('numberForm').classList.add('hidden');
            document
              .getElementById('verificationForm')
              .classList.remove('hidden');
            this.syncing = false;
            return confirmationResult;
            // ...
          })
          .catch((error) => {
            // Error; SMS not sent
            // ...
            window.alert('verify phone number failed' + error);
            this.syncing = false;
            window.recaptchaVerifier.render().then((widgetId) => {
              window.recaptchaVerifier._reset(widgetId);
              // document.getElementById('register').classList.add('hidden');
              // document.getElementById('start-recaptcha').classList.add('hidden');
              document
                .getElementById('login-button-container')
                .classList.add('hidden');
              return this.clickVerifyPhoneNumber(widgetId);
            });
          });
      };
      if (this.rememberMe) {
        const user = await setPersistence(auth, browserSessionPersistence).then(
          () => {
            // Existing and futurd(auth, email, password);
            return _signInToFirebase();
          }
        );
        return user;
      } else {
        return await _signInToFirebase();
      }
    },
    clickCheckVerificationCode: async function () {
      const code = this.verificationCode.trim();
      if (code) {
        var token = '';
        try {
          const confirmationResult = await window.confirmationResult.confirm(
            code
          );

          var result = confirmationResult;

          //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#retrieve_id_tokens_on_clients
          token = await result.user.getIdToken(true); //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#:~:text=Retrieve%20ID%20tokens%20on%20clients%20When%20a%20user,user%20or%20device%20on%20your%20custom%20backend%20server.
          // var refreshToken = await result.user.getRefreshToken(true);
        } catch (error) {
          window.alert(
            `Firebase unable to confirm the verificationCode and threw: ${error}`
          );
          return;
        }
        try {
          const user = await Cloud.loginWithFirebase(this.phoneNumber, token);
          this.showToast(`Login Success: Hi ${user.name || user.email || 'user'}`);
          window.location.replace('/admin');
        } catch (error) {
          // User couldn't sign in (bad verification code?)
          if (error.status === 404) {
            window.location.replace('/admin/signup');
          } else {
            window.alert(error);
          }
        }
        // window.confirmationResult.confirm(code)
        //   .then((result) => {
        //     // window.alert(result);
        //     // User signed in successfully.
        //     //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#retrieve_id_tokens_on_clients
        //     return result.user.getIdToken(true); //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#:~:text=Retrieve%20ID%20tokens%20on%20clients%20When%20a%20user,user%20or%20device%20on%20your%20custom%20backend%20server.
        //   }).then((token) => {
        //     return Cloud.loginWithFirebase(this.phoneNumber, token, false); // BUG: Error: Invalid usage with serial arguments: Received unexpected third argument.
        //   }).then((user) => {
        //     window.alert('Logged in with firebase' + user);
        //   }).catch((error) => {
        //     // User couldn't sign in (bad verification code?)
        //     if (error.status === 404) {
        //       window.location.replace('/admin/signup');
        //     } else {
        //       if (error.name === 'FirebaseError') {
        //         console.log(error);
        //       } else {
        //         console.log(error);
        //       }
        //       window.alert('Cloud.loginWithFirebase threw:');
        //       window.alert(error); // BUG: Cloud returned FirebaseError: Firebase: Error(auth / network - request - failed).
        //     }
        //   });
      } else {
        window.alert('Verification code was empty! Please add SMS Code!');
        throw new Error('badVerificationCode');
      }
    },

    // displayErrorFields: function (hide) {
    //   hide = !!hide;
    //   var elements = document.querySelectorAll('[role="alert"]');
    //   for (var el in elements) {
    //     if (hide && el.classList) {
    //       el.classList.add('hidden');
    //     } else {
    //       el.classList.remove('hidden');
    //     }
    //   }
    // },

    // * navigation functions
    toRegister: function () {
      window.location.replace('/admin/signup');
    },
    toLoginWithPassword: function () {
      window.location.replace('/admin/login-with-password');
    },
    
    // * parse inputs
    // * Front End Form Valiadation, parse and styling functions
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
    parseNumberInputsToArgIns: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      const firebasePhoneRegex = /^\+\d{1,2} \d{3}-\d{3}-\d{4}$/;
      const inputText = this.phoneNumber.trim();
      var argins = {
        phoneNumber: inputText,
      };

      if (inputText.match(firebasePhoneRegex)) {
        this.phoneNumber = argins['phoneNumber'];
        return argins;
      } else {
        this.formErrors.phoneNumber = true;
        // throw new Error('badPhoneNumberFormat');
        return undefined; //Cancel Submission
      }
    },
    handleParsingFormFirebase: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.formData;

      // Validate email:
      if (!argins.phoneNumber) {
        this.formErrors.phoneNumber = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },
    submittedVerifyCodeForm: function () {
      if (!this.cloudError) {
        this.syncing = true;
        location.replace('/admin');
      } else {
        this.cloudError = '';
      }
    },
    parseVerificationCodeToArgIns: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      const firebaseVerifCodeRegex = /^\d{6}$/;
      const inputText = this.verificationCode.trim();

      var argins = {
        verificationCode: inputText,
      };

      if (inputText.match(firebaseVerifCodeRegex)) {
        return argins;
      } else {
        this.formErrors.verificationCode = true;
        // throw new Error('badVerificationCode');
      }
    },

    // * display functions
    showToast: function (message) {
      Toastify({
        text: message,
        duration: 3000,
        destination: 'https://github.com/apvarun/toastify-js',
        newWindow: true,
        close: true,
        gravity: 'top', // `top` or `bottom`
        position: 'left', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  },
});
