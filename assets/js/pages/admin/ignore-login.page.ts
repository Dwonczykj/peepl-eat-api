// // import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
// // const _ = require('lodash');
// // import * as _ from 'lodash';
// var SAILS_LOCALS:any;
// var firebase:any;
// var sails: any;
// var firebaseui:any;
// var parasails: any;


// parasails.registerPage('login', { // Fix the issue where we have both an action and page with the name login?
//   //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
//   //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
//   //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
//   data: {
//     syncing: false,
//     cloudError: false,
//     formData: {
//       emailAddress: '',
//       phoneNumber: '',
//       password: '',
//       rememberMe: false
//     },
//     formErrors: {
//     },
//     formRules: {
//       phoneNumber: {
//         required: true,
//         regex: /^\+?\d{0,13}$/
//       },
//       status: {
//       }
//     },
//     userPhoneNumber: '',
//   },

//   //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
//   //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
//   //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
//   beforeMount: function () {
//     _.extend(this, SAILS_LOCALS);
//   },
//   mounted: async function () {
//     this.$focus('[autofocus]');

//     // https://firebaseopensource.com/projects/firebase/firebaseui-web/#using_firebaseui%20for%20authentication
//     // https://firebase.google.com/docs/auth/web/phone-auth

//     // const auth = getAuth();
//     // // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
//     // window.recaptchaVerifier = new RecaptchaVerifier('firebase-sign-in-button', {
//     //   'size': 'invisible',
//     //   'callback': (response) => {
//     //     // reCAPTCHA solved, allow signInWithPhoneNumber.
//     //     console.debug(response);
//     //     debugger;
//     //   }
//     // }, auth);

//     // FirebaseUI config.
//     var uiConfig = {
//       signInSuccessUrl: '/admin',
//       signInOptions: [
//         // Leave the lines as is for the providers you want to offer your users.
//         // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//         // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
//         // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
//         // firebase.auth.GithubAuthProvider.PROVIDER_ID,
//         // firebase.auth.EmailAuthProvider.PROVIDER_ID,
//         firebase.auth.PhoneAuthProvider.PROVIDER_ID,
//         // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
//       ],
//       // tosUrl and privacyPolicyUrl accept either url string or a callback
//       // function.
//       // Terms of service url/callback.
//       tosUrl: 'https://vegiapp.co.uk/privacy',
//       // Privacy policy url/callback.
//       privacyPolicyUrl: function () {
//         window.location.assign('https://vegiapp.co.uk/privacy');
//       }
//     };

//     // Initialize the FirebaseUI Widget using Firebase.
//     var ui = new firebaseui.auth.AuthUI(firebase.auth());
//     // The start method will wait until the DOM is loaded.
//     ui.start('#firebaseui-auth-container', uiConfig);

//     sails.log('firebase initialised');
//   },

//   //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
//   //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
//   //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
//   methods: {
//     changeUserPhoneNumber: function (phoneNumber) {
//       this.userPhoneNumber = phoneNumber;
//     },
//     fetch6DCode: async function () {
//       //TODO: show the iframe and wait for user to input the code.
//     },
//     handleSignInFirebase: async function () {

//       // const appVerifier = window.recaptchaVerifier;
//       // //TODO: Add RemememberMe like in login-with-firebase.ts api endpoint setPersistence f-wrap.
//       // const auth = getAuth();
//       // const rememberMe = this.formData.rememberMe;
//       // signInWithPhoneNumber(auth, this.formData.phoneNumber, appVerifier)
//       //     .then( async (confirmationResult) => {
//       //       // SMS sent. Prompt user to type the code from the message, then sign the
//       //       // user in with confirmationResult.confirm(code).
//       //       window.confirmationResult = confirmationResult;

//       //       const verify6DCode = await fetch6DCode(); //TODO: Workout how to implement this using the docs.
//       //       const userCredential = await confirmationResult.confirm(verify6DCode);
//       //       const firebaseSessionToken = await userCredential.user.getIdToken();
//       //       //TODO: Call the login-with-firebase api method with the token from this confirmationResult.
//       //       Cloud.loginWithFirebase(firebaseSessionToken, rememberMe)
//       //         .then(() => {
//       //           window.location = '/admin';
//       //         });
//       //       // ...
//       //     }).catch((error) => {
//       //       // Error; SMS not sent
//       //       // ...
//       //     });
//     },
//     handleParsingForm: function () {
//       // Clear out any pre-existing error messages.
//       this.formErrors = {};

//       var argins = this.formData;

//       // Validate email:
//       if (!argins.emailAddress) {
//         this.formErrors.emailAddress = true;
//       }

//       // Validate password:
//       if (!argins.password) {
//         this.formErrors.password = true;
//       }

//       // If there were any issues, they've already now been communicated to the user,
//       // so simply return undefined.  (This signifies that the submission should be
//       // cancelled.)
//       if (Object.keys(this.formErrors).length > 0) {
//         return;
//       }

//       return argins;
//     },
//     submittedForm: function () {
//       this.syncing = true;
//       location.replace('./admin');
//     },
//     handleParsingFormFirebase: function () {
//       // Clear out any pre-existing error messages.
//       this.formErrors = {};

//       var argins = this.formData;

//       // Validate email:
//       if (!argins.phoneNumber) {
//         this.formErrors.phoneNumber = true;
//       }

//       // If there were any issues, they've already now been communicated to the user,
//       // so simply return undefined.  (This signifies that the submission should be
//       // cancelled.)
//       if (Object.keys(this.formErrors).length > 0) {
//         return;
//       }

//       return argins;
//     },
//     submittedFormFirebase: function () {
//       this.syncing = true;
//       location.replace('./admin');
//     },
//   }
// });
