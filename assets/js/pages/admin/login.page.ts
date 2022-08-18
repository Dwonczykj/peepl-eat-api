import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

var parasails:any;
var SAILS_LOCALS:any;

parasails.registerPage('login', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formData: {
      emailAddress: '',
      password: '',
      rememberMe: false
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
    userPhoneNumber: '',
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
    this.$focus('[autofocus]');

    // https://firebaseopensource.com/projects/firebase/firebaseui-web/#using_firebaseui%20for%20authentication
    // https://firebase.google.com/docs/auth/web/phone-auth
    
    const auth = getAuth();
    // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
    window.recaptchaVerifier = new RecaptchaVerifier('firebase-sign-in-button', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        sails.helpers.onSignInSubmit();
      }
    }, auth);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    changeUserPhoneNumber: function(phoneNumber){
      this.userPhoneNumber = phoneNumber;
    },
    handleSignInFirebase: function(){
      const phoneNumber = this.userPhoneNumber;
      const appVerifier = window.recaptchaVerifier;

      const auth = getAuth();
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            // ...
          }).catch((error) => {
            // Error; SMS not sent
            // ...
          });
    },
    handleParsingForm: function() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.formData;

      // Validate email:
      if(!argins.emailAddress) {
        this.formErrors.emailAddress = true;
      }

      // Validate password:
      if(!argins.password) {
        this.formErrors.password = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },
    submittedForm: function() {
      this.syncing = true;
      window.location = '/admin';
    },
    clickLoginWithFirebase: function () {
      //firebase docs recommended firebaseUI for showing the recapthcha login field.
      //TODO: Implement clickLoginWithFirebase
      throw new Error('Not Implemented this yet!');
    },
  }
});
