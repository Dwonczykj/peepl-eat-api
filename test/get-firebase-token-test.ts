const firebase = require('firebase-admin');
const initializeApp = firebase.app.initalizeApp;


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const _firebaseConfig = {
    apiKey: 'AIzaSyCeBtylKfX-VhK7TvWwjgOG-pxjwdOSdbQ',
    authDomain: 'grept-wallet.firebaseapp.com',
    projectId: 'grept-wallet',
    storageBucket: 'grept-wallet.appspot.com',
    messagingSenderId: '222395317174',
    appId: '1:222395317174:web:5505ca345b5c6435ee5f17'
};

initializeApp(_firebaseConfig);

// TODO: Workout if we can test SignInWithPhoneNumber
// firebase.auth().signInAnonymously().then(() => { //TODO: Turn to 
//     firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
//         console.log(idToken);
//         debugger;
//         // ...
//     }).catch(function (error) {
//         console.error(error);
//     });
// });