import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator, getAuth,
  signInWithEmailAndPassword
} from 'firebase/auth';
import Toastify from 'toastify-js';
// import 'toastify-js/src/toastify.css'; // ~ https://github.com/apvarun/toastify-js/blob/master/README.md

parasails.registerPage('login-with-password', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    cloudCode: false,
    formErrors: {},
    formData: {
      email: '',
      password: '',
      rememberMe: false,
    },
    email: '',
    password: '',
    rememberMe: false,
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
    this.$focus('[autofocus]');
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    handleParsingForm: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};
      const setFormErrors = {};

      const email = this.email;
      const password = this.password;
      const rememberMe = this.rememberMe;

      var argins = {
        email,
        password,
        rememberMe,
      };

      // Validate email:
      if (!argins.email) {
        setFormErrors.email = true;
      }

      // Validate password:
      if (!argins.password) {
        setFormErrors.password = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
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
        email: this.email.toString().trim(),
        password: this.password.toString().trim(),
        rememberMe: this.rememberMe,
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

    // * Submission Functions
    loginWithPassword: async function () {
      this.handleParsingForm();
      if (this.formErrorsExist()) {
        return;
      }
      // var argins = this.getSubmissionArgs();
      const email = this.email;
      const password = this.password;
      const rememberMe = this.rememberMe;

      const auth = getAuth();
      this.cloudCode = false;
      let _userExists = { data: false };
      try {
        _userExists = await Cloud.userExistsForEmail(email);
      } catch (unusedError) {
        _userExists = { data: false };
      }
      const userExists = _userExists;

      let _userCreds;
      try {
        _userCreds = await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        this.cloudCode = err.code;
        if (err.code === 'auth/user-not-found') {
          this.cloudError = 'Invalid credentials!';
          if (userExists.data === true) {
            this.cloudCode = 'LegacyUser';
            // return this.registerEmailPasswordFirebaseOnly(email, password);
          }
          return;
        } else if (err.code === 'auth/wrong-password') {
          this.cloudError = `Invalid Credentials!`;
          return;
        } else {
          this.cloudError = `Unable to Authenticate User`;
          console.warn(`Unable to signin using firebase API: ${err}`);
          return;
        }
      }
      const userCredential = _userCreds;
      const fbUser = userCredential.user;
      const sessionToken = await fbUser.getIdToken(true);

      var _vegiUser;
      try {
        this.cloudCode = false;
        _vegiUser = await Cloud.loginWithPassword(
          email,
          sessionToken,
          rememberMe
        );
        this.showToast(
          `Login Success: Hi ${_vegiUser.name || _vegiUser.email || 'user'}`
        );
      } catch (err) {
        this.cloudCode = err.exit;
        this.cloudError = err.exit;
        // if (err.exit === 'userExists') {
        //   this.cloudError = 'Unable to login. Check credentials.';
        // } else if (err.exit === 'badCombo') {
        //   this.cloudError = `badCombo`;
        // } else if (err.exit === 'badCredentials') {
        //   this.cloudError = `badCredentials`;
        // } else if (err.exit === 'firebaseUserNoEmail') {
        //   this.cloudError = `Invalid Credentials`;
        // } else if (err.exit === 'firebaseIncorrectEmail') {
        //   this.cloudError = `Invalid Credentials`;
        // } else if (err.exit === 'userNeedsToLinkFirebaseAtSignUp') {
        //   this.cloudError = `userNeedsToLinkFirebaseAtSignUp`;
        // } else {
        //   this.cloudError = err.exit;
        //   // eslint-disable-next-line no-console
        //   console.warn(`[${err.code}]: ${err.message}`);
        // }
      }
      // const vegiSigninResponse = _vegiSigninResponse;

      this.submittedForm();
    },
    // registerEmailPasswordFirebaseOnly: function(email, password) {
    //   const auth = getAuth();
    //   return createUserWithEmailAndPassword(auth, email, password)
    //     .then((userCredential) => {
    //       // Signed in
    //       const fbUser = userCredential.user;

    //       // eslint-disable-next-line no-console
    //       console.log(fbUser.email + ' authorised signed in to firebase.');
    //       return fbUser.getIdToken(true);
    //     })
    //     .then(sessionToken => {
    //       return Cloud.loginWithPassword(email, sessionToken, this.rememberMe);
    //     })
    //     .then(response => {
    //       location.replace('/admin');
    //     })
    //     .catch((err) => {
    //       this.cloudError = err.message;
    //       console.warn(err.responseInfo);
    //       if (err.exit === 'userExists') {
    //         this.cloudError = 'Unable to login. Check credentials.';
    //       }
    //       // eslint-disable-next-line no-console
    //       console.warn(err);
    //     });
    // },

    // *Form submitted style functions
    submittedForm: function () {
      this.syncing = true;
      if (!this.formErrorsExist()) {
        return this.toHome();
      }
      this.syncing = false;
    },

    // * navigation functions
    toHome: function () {
      window.location.replace('/admin');
    },
    toRegister: function () {
      window.location.replace('/admin/signup');
    },
    toLoginWithPassword: function () {
      window.location.replace('/admin/login-with-password');
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
    },
  },
});
