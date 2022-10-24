import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator, createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword
} from 'firebase/auth';

parasails.registerPage('login-with-password', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    syncing: false,
    cloudError: false,
    formErrors: {},
    formData: {
      emailAddress: '',
      password: '',
      rememberMe: false,
    },
    emailAddress: '',
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
      apiKey: 'AIzaSyB9hAjm49_3linYAcDkkEYijBiCoObXYfk', //! apiKey is fine: See: https://firebase.google.com/docs/projects/api-keys
      authDomain: 'vegiliverpool.firebaseapp.com',
      projectId: 'vegiliverpool',
      storageBucket: 'vegiliverpool.appspot.com',
      messagingSenderId: '526129377',
      appId: '1:526129377:web:a0e4d54396cbdebe70bfa0',
      measurementId: 'G-YZCWVWRNKN',
    };
    initializeApp(config);
    const auth = getAuth();
    connectAuthEmulator(auth, 'http://localhost:9099');
    this.$focus('[autofocus]');
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    handleParsingForm: function () {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      const email = this.emailAddress;
      const password = this.password;
      const rememberMe = this.rememberMe;

      var argins = {
        email,
        password,
        rememberMe
      };

      // Validate email:
      if (!argins.emailAddress) {
        this.formErrors.emailAddress = true;
      }

      // Validate password:
      if (!argins.password) {
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

    // * Submission Functions
    loginWithPassword: async function () {
      const email = this.emailAddress;
      const password = this.password;
      const rememberMe = this.rememberMe;

      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          // Signed in
          const fbUser = userCredential.user;

          // eslint-disable-next-line no-console
          const sessionToken = await fbUser.getIdToken(true);
          console.log(fbUser.email + ' authorised signed in to firebase with session token ' + sessionToken);

          return Cloud.loginWithPassword(email, sessionToken, rememberMe);
        })
        .then((response) => {
          location.replace('/admin');
        })
        .catch((err) => {
          if (err.code === 'auth/user-not-found') {
            Cloud.userExistsForEmail(email).then((userExists) => {
              if (userExists && userExists.data === true) {
                return this.registerEmailPasswordFirebaseOnly(email, password);
              }
            });
          }
          else if (err.exit === 'userExists') {
            this.cloudError = 'Unable to login. Check credentials.';
          }
          else if (err.code === 'firebaseErrored') {
            this.cloudError = `${err.message}`;
            // eslint-disable-next-line no-console
            console.warn(err.responseInfo);
          }
          else {
            this.cloudError = `[${err.code}]: ${err.message}`;
            // eslint-disable-next-line no-console
            console.warn(err.responseInfo);
          }
        });
    },
    registerEmailPasswordFirebaseOnly: function(email, password) {
      const auth = getAuth();
      return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const fbUser = userCredential.user;

          // eslint-disable-next-line no-console
          console.log(fbUser.email + ' authorised signed in to firebase.');
          return fbUser.getIdToken(true);
        })
        .then(sessionToken => {
          return Cloud.loginWithPassword(email, sessionToken, this.rememberMe);
        })
        .then(response => {
          location.replace('/admin');
        })
        .catch((err) => {
          this.cloudError = err.message;
          console.warn(err.responseInfo);
          if (err.exit === 'userExists') {
            this.cloudError = 'Unable to login. Check credentials.';
          }
          // eslint-disable-next-line no-console
          console.warn(err);
        });
    },

    // *Form submitted style functions
    submittedForm: function () {
      this.syncing = true;
      window.location = '/admin';
    },

    // * navigation functions
    toRegister: function () {
      window.location.replace('/admin/signup');
    },
    toLoginWithPassword: function () {
      window.location.replace('/admin/login-with-password');
    },
  },
});
