/**
 * firebase
 * @description :: Policy that attaches the firebase admin sdk onto `req.firebase`
 */

const dotenv = require("dotenv");
const envConfig = dotenv.config("./env").parsed;

// const firebase = require('firebase-admin');
// const config = require('./../../config/custom').custom.firebase;
// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// const initializeApp = require('firebase-admin/app').initalizeApp;
// const firebase = require('firebase-admin');
// const initializeApp = firebase.initalizeApp;


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// firebase.initializeApp({
//   credential: firebase.credential.cert(config.credential),
//   databaseURL: config.url,
// });

// Your web app's Firebase configuration
// const _firebaseConfig = {
//     apiKey: 'AIzaSyCeBtylKfX-VhK7TvWwjgOG-pxjwdOSdbQ',
//     authDomain: 'grept-wallet.firebaseapp.com',
//     projectId: 'grept-wallet',
//     storageBucket: 'grept-wallet.appspot.com',
//     messagingSenderId: '222395317174',
//     appId: '1:222395317174:web:5505ca345b5c6435ee5f17'
// };

// // * Initialize Firebase for each individual request to the api.
// const app = firebase.initializeApp(_firebaseConfig);
const isDebugEnv = !!envConfig['FIREBASE_AUTH_EMULATOR_HOST']; // * process.env.FIREBASE_AUTH_EMULATOR_HOST
var admin = require('firebase-admin');
var serviceAccount = require('../../config/vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json');
if(isDebugEnv){
  admin.initializeApp({ projectId: "vegiliverpool" });
  // eslint-disable-next-line no-console
  console.log('RUNNING APP IN DEBUG MODE VS FIREBASE EMULATOR');
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = async function (req, res, proceed) {
  req.firebase = admin;
  proceed();
};

