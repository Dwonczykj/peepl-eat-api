/* eslint-disable no-console */
// test/integration/controllers/admin/firbase.test.js
const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
const axios = require("axios").default;
import { envConfig } from "../../../utils";
// var util = require("util");

import { initializeApp } from "firebase/app";
import {
  // connectAuthEmulator,
  // createUserWithEmailAndPassword,
  getAuth, RecaptchaVerifier, signInWithEmailAndPassword,
  signInWithPhoneNumber
} from "firebase/auth";

const config = {
  apiKey: "AIzaSyB9hAjm49_3linYAcDkkEYijBiCoObXYfk", //! apiKey is fine: See: https://firebase.google.com/docs/projects/api-keys
  authDomain: "vegiliverpool.firebaseapp.com",
  projectId: "vegiliverpool",
  storageBucket: "vegiliverpool.appspot.com",
  messagingSenderId: "526129377",
  appId: "1:526129377:web:a0e4d54396cbdebe70bfa0",
  measurementId: "G-YZCWVWRNKN",
};
initializeApp(config);
const auth = getAuth();
// connectAuthEmulator(auth, "http://localhost:9099");

describe("Firebase Tests", () => {
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
      try {
	      const creds = await signInWithEmailAndPassword(
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
        .then(function (confirmationResult) {
          return confirmationResult.confirm(verificationCode);
        })
        .catch(function (error) {
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
      const postBaseUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1`;
      const postUrlRegisterDummyUser = `/accounts:signUp?key=${envConfig["firebaseAPIKey"]}`;
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
