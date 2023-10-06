/* eslint-disable no-console */
// test/integration/controllers/admin/firbase.test.js
const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
const axios = require("axios").default;
// var util = require("util");

import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  // createUserWithEmailAndPassword,
  getAuth, Auth, RecaptchaVerifier,
  signInWithEmailAndPassword, UserCredential,
  signInWithPhoneNumber
} from "firebase/auth";
declare var sails:any;

let auth: Auth;
describe("Firebase Tests", () => {
  before(() => {
    const config = {
      apiKey: 'AIzaSyAMuCLTWhvhskSgrDw4XxHk1is1qjZDfNo',
      authDomain: 'we-are-vegi-app.firebaseapp.com',
      projectId: 'we-are-vegi-app',
      storageBucket: 'we-are-vegi-app.appspot.com',
      messagingSenderId: '786588268049',
      appId: '1:786588268049:web:6bc3dc97d842cc9a40e3b0',
      measurementId: 'G-Z8ZLV0VJ2G',
    };
    initializeApp(config);
    auth = getAuth();
    if (sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST) {
      connectAuthEmulator(
        auth,
        sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST
      );
    }
  });
  // describe("Signin with Credential", () => {
  //   it("succeeds", async () => {
  //     const creds = await signInWithCredential(auth,
  //         GoogleAuthProvider.credential(
  //           '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
  //         )
  //       );
  //     console.log(creds);
  //     assert.containsAllKeys(creds, ["user"]);
  //   });
  // });
  // describe("Register User with Email & Password", () => {
  //   it("registration succeeds", async () => {
  //     const creds = await createUserWithEmailAndPassword(
  //       auth,
  //       "test_user@vegiapp.co.uk",
  //       "Testing123"
  //     );
  //     console.log(creds);
  //     assert.containsAllKeys(creds, ["user"]);
  //   });
  //   it("login with new test user succeeds", async () => {
  //     const creds = await signInWithEmailAndPassword(
  //       auth,
  //       "test_user@vegiapp.co.uk",
  //       "Testing123"
  //     );
  //     console.log(creds);
  //     assert.containsAllKeys(creds, ["user"]);
  //   });
  // });
  describe("Signin with Email", () => {
    it("succeeds", async () => {
      let _creds: UserCredential;
      try {
	      _creds = await signInWithEmailAndPassword(
	        auth,
	        "joey@vegiapp.co.uk",
	        "DUMMY_FIREBASE_TOKEN" //"Testing123"
	      );
      } catch (error) {
        if(error.code === 'auth/operation-not-supported-in-this-environment'){
          console.warn('Check running FirebaseAuth Emulator');
        }
        throw error;
      }
      const creds = _creds;
      console.log(creds);
      assert.containsAllKeys(creds, ["user"]);
    });
  });
  describe("Signin with Phone", () => {
    it("succeeds", async () => {
      // Turn off phone auth app verification.

      const recaptcha = new RecaptchaVerifier('recaptcha-container', {
      }, auth);
      const verificationCode = "133337";
      const creds = await signInWithPhoneNumber(
        auth,
        "+1 234-566-9420",
        recaptcha
      )
        .then((confirmationResult) => {
          return confirmationResult.confirm(verificationCode);
        })
        .catch((error) => {
          // Error; SMS not sent
          // ...
          throw error;
        });

      console.log(creds);
      assert.containsAllKeys(creds, ["user"]);
    });
  });
  // describe("Signin with Phone", () => {
  //   it("succeeds", async () => {

  //     signInWithPhoneNumber(auth,"+447905532512",);
  //   });
  // });
  describe("Firebase can register user to emulator", () => {
    it("Posts to Register", async () => {
      const postBaseUrl = `${sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1`;
      const postUrlRegisterDummyUser = `/accounts:signUp?key=${sails.config.custom.firebaseAPIKey}`;
      const instance = axios.create({
        baseURL: postBaseUrl,
        timeout: 2000,
        headers: { },
      });
      console.log('Post to emulator');
      await instance
        .post(postUrlRegisterDummyUser, {
          email: "joey_dummy1@vegiapp.co.uk",
          password: "Testing123",
        })
        .then(async (response) => {
          assert.containsAllKeys(response.body, [
            "idToken",
            "email",
            "refreshToken",
          ]);
          console.log(response);
        })
        .catch((err) => {
          throw err;
        });
    });
  });


});
