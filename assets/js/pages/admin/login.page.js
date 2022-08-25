/* eslint-disable no-console */
import { initializeApp } from 'firebase/app';
import { browserSessionPersistence, getAuth, RecaptchaVerifier, setPersistence, signInWithPhoneNumber } from 'firebase/auth';

parasails.registerPage('login', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formErrors: {

    },
    // phoneNoCountryNoFormat: '7905532512', //Moved to property getter
    countryCode: '44',
    phoneNoCountry: '790-553-2512', //TODO: remove this from commit APIKEY
    preventNextIteration: false,
    verificationCode: '',
    viewVerifyCodeForm: false,
    rememberMe: false,
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
      return this.phoneNoCountryNoFormat.replace(/(\d{1,3})(\d{1,3})(\d{1,4})/g, '$1-$2-$3');
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
      apiKey: 'AIzaSyB9hAjm49_3linYAcDkkEYijBiCoObXYfk', //! apiKey is fine: See: https://firebase.google.com/docs/projects/api-keys
      authDomain: 'vegiliverpool.firebaseapp.com',
      projectId: 'vegiliverpool',
      storageBucket: 'vegiliverpool.appspot.com',
      messagingSenderId: '526129377',
      appId: '1:526129377:web:a0e4d54396cbdebe70bfa0',
      measurementId: 'G-YZCWVWRNKN'
    };
    initializeApp(config);

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
      //TODO: Switch to invisible?
      // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      //   'size': 'invisible',
      //   'callback': (response) => {
      //     window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
      //     //unhide phone number form
      //     document.getElementById('numberForm').removeAttribute('hidden');
      //   },
      //   'expired-callback': () => {
      //     window.alert('repatcha expired callback called');
      //   }
      // }, auth);
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          // window.alert('repatcha  callback called -> call the getVerificationCode flow' + response.toString());
          //unhide phone number form
          document.getElementById('start-recaptcha').classList.remove('hidden');

          this.viewForm = 'numberForm';
          document.getElementById('numberForm').classList.remove('hidden');
        },
        'expired-callback': () => {
          window.alert('recatcha expired!');
        }
      }, auth);

      var elements = document.querySelectorAll('[role="alert"]');
      for (var el in elements) {
        if (el && el.classList) {
          el.classList.remove('hidden');
        }
      }
    },
    diplayErrorFields: function (hide) {
      hide = !!hide;
      var elements = document.querySelectorAll('[role="alert"]');
      for (var el in elements) {
        if (hide && el.classList) {
          el.classList.add('hidden');
        } else {
          el.classList.remove('hidden');
        }
      }
    },
    phoneNumberFocusOut: function (event) {
      if (['Arrow', 'Backspace', 'Shift'].includes(event.key)) {
        this.preventNextIteration = true;
        return;
      }
      if (this.preventNextIteration) {
        this.preventNextIteration = false;
        return;
      }

      this.phoneNoCountry = this.phoneNoCountryFormatted;
    },
    loadFirstCaptchaUser: function () {
      this.syncing = true;
      if (!window.recaptchaVerifier) {
        this.createRecaptcha();
      }

      try {
        if (this.phoneNumber && Object.keys(this.formErrors).length < 1) {
          return window.recaptchaVerifier.render()
            .then((widgetId) => {
              this.syncing = false;
              // document.getElementById('register').classList.add('hidden');
              // document.getElementById('start-recaptcha').classList.add('hidden');
              document.getElementById('login-button-container').classList.add('hidden');
              document.getElementById('recaptcha-container').classList.add('hidden');
              return this.clickVerifyPhoneNumber(widgetId);
            });
        }
      } catch (err) {
        this.syncing = false;
        return undefined;
      }
      this.syncing = false;
      return undefined;
    },
    toRegister: function () {
      window.location.replace('/admin/signup');
    },
    parseNumberInputsToArgIns: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      const firebasePhoneRegex = /^\+\d{1,2} \d{3}-\d{3}-\d{4}$/;
      const inputText = this.phoneNumber.trim();
      var argins = {
        'phoneNumber': inputText,
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
        'verificationCode': inputText,
      };

      if (inputText.match(firebaseVerifCodeRegex)) {
        return argins;
      } else {
        this.formErrors.verificationCode = true;
        // throw new Error('badVerificationCode');
      }
    },
    clickVerifyPhoneNumber: async function (widgetId) {
      // const phoneNumber = document.getElementById('phoneNumber').value;
      const phoneNumber = this.phoneNumber;
      const appVerifier = window.recaptchaVerifier;

      const userExists = await Cloud.userExistsForPhone(this.countryCode, this.phoneNoCountryNoFormat);
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
            document.getElementById('verificationForm').classList.remove('hidden');
            this.syncing = false;
            return confirmationResult;
            // ...
          }).catch((error) => {
            // Error; SMS not sent
            // ...
            window.alert('verify phone number failed' + error);
            this.syncing = false;
            window.recaptchaVerifier.render().then((widgetId) => {
              window.recaptchaVerifier._reset(widgetId);
              // document.getElementById('register').classList.add('hidden');
              // document.getElementById('start-recaptcha').classList.add('hidden');
              document.getElementById('login-button-container').classList.add('hidden');
              return this.clickVerifyPhoneNumber(widgetId);
            });
          });
      };
      if (this.rememberMe) {
        const user = await setPersistence(auth, browserSessionPersistence)
          .then(() => {
            // Existing and futurd(auth, email, password);
            return _signInToFirebase();
          });
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
          const confirmationResult = await window.confirmationResult.confirm(code);

          var result = confirmationResult;

          //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#retrieve_id_tokens_on_clients
          token = await result.user.getIdToken(true); //* https://firebase.google.com/docs/auth/admin/verify-id-tokens#:~:text=Retrieve%20ID%20tokens%20on%20clients%20When%20a%20user,user%20or%20device%20on%20your%20custom%20backend%20server.
          // var refreshToken = await result.user.getRefreshToken(true);
          console.log(token);
        } catch (error) {
          window.alert('Firebase unable to confirm the verificationCode and threw');
          return;
        }
        try {
          var user = await Cloud.loginWithFirebase(this.phoneNumber, token);

          window.location.replace('/admin');
        } catch (error) {
          // User couldn't sign in (bad verification code?)
          if (error.status === 404) {
            window.location.replace('/admin/signup');
          } else {
            if (error.name === 'FirebaseError') {
              console.log(error);
            } else {
              console.log(error);
            }
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
    // test: async function () {
    //   try {
    //     var userExists = await Cloud.userExistsForEmail('joey@vegiapp.co.uk');
    //     window.alert('User exists ' + userExists);

    //     var userExists = await Cloud.userExistsForPhone(44, 7905532512);
    //     // eslint-disable-next-line no-debugger

    //     window.alert('User exists ' + userExists);

    //     var user = await Cloud.loginWithFirebase(this.phoneNumber, 'DUMMY TOKEN'); // BUG: Error: Invalid usage with serial arguments: Received unexpected third argument.
    //     // var user = await Cloud.loginWithFirebase(this.phoneNumber, token, refreshToken); // BUG: Error: Invalid usage with serial arguments: Received unexpected third argument.
    //     // eslint-disable-next-line no-debugger
    //     debugger;
    //     window.alert('Logged in with firebase: ' + user.id);

    //     window.location.replace('/admin');
    //   } catch (error) {
    //     // User couldn't sign in (bad verification code?)
    //     // eslint-disable-next-line no-debugger
    //     debugger;
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
    //   }
    // }
  }
});
