/* eslint-disable no-console */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { login, callAuthActionWithCookie } = require("../../../utils");
const {fixtures} = require("../../../../scripts/build_db");
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");

// require("ts-node/register");

class ExpectResponseLogin extends ExpectResponse {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
    });
  }

  customChecks({ responseBody, expectedResponse }) {
    // expect(responseBody.orderedDateTime).closeTo(
    //   expectedResponse.orderedDateTime,
    //   100,
    //   "OrderedDateTime should be within 100s of test."
    // );
    // ~ https://devenum.com/delete-property-from-objects-array-in-javascript/#:~:text=Delete%20property%20from%20objects%20Array%20in%20Javascript%20%286,to%20Delete%20property%20from%20objects%20array%20in%20Javascript
    // delete expectedResponse.orderedDateTime;

    // delete expectedResponse.publicId;

    expect(responseBody).to.have.property("data");
    assert.isObject(responseBody.data);
    // const userFixture = fixtures.users_fixed
    //   .map(({ firebaseSessionToken, secret, ...RestUserdata }) => RestUserdata) // ~https://devenum.com/delete-property-from-objects-array-in-javascript/#:~:text=Delete%20property%20from%20objects%20Array%20in%20Javascript%20%286,to%20Delete%20property%20from%20objects%20array%20in%20Javascript
    //   .filter((user) => user.name === "TEST_SERVICE")[0];
    // expect(responseBody.data).to.include(userFixture);

    return expectedResponse;
  }
}

class HttpAuthTestSenderLogin extends HttpAuthTestSender {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    useAccount = "TEST_SERVICE",
    sendData = {},
    expectResponse = {},
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      useAccount,
      sendData,
      expectResponse,
      ExpectResponseLogin,
    });
  }
}

const IS_LOGGED_IN = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in",
  sendData: {
    
  },
  expectResponse: {
    data: true,
  },
};
const IS_LOGGED_IN_UNAUTHENTICATED = {
  useAccount: "TEST_UNAUTHENTICATED",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in",
  sendData: {},
  expectResponse: {
    data: false,
  },
};
// const VIEW_LOGIN = {
//   useAccount: "TEST_UNAUTHENTICATED",
//   HTTP_TYPE: "get",
//   ACTION_PATH: "admin",
//   ACTION_NAME: "login",
//   sendData: {},
//   expectResponse: {
    
//   },
// };
const LOGIN = {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {
    
  },
  expectResponse: {
    data: true,
  },
};
const LOGIN_AS_USER = {
  useAccount: "TEST_USER",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {},
  expectResponse: {
    data: true,
  },
};
const LOGIN_AS_VENDOR = {
  useAccount: "TEST_VENDOR",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {},
  expectResponse: {
    data: true,
  },
};
const LOGIN_AS_DELIVERY_PARTNER = {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {},
  expectResponse: {
    data: true,
  },
};


describe("Authentication Tests", () => {
  describe("Login Tests", () => {
    it("GET view-login", (done) => {
      supertest(sails.hooks.http.app)
        .get("/admin/login")
        .set("Cookie", "")
        .expect(200)
        .then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.text).to.have.string(
            '<div id="login" class="admin" v-cloak>'
          );
          return done();
        })
        .catch((errs) => {
          console.warn(errs);
          return done(errs);
        });
    });
    it("POST login-with-secret works", async () => {
      try {
	      const response = await login();
	        
	      expect(response.statusCode).to.equal(200);
	      expect(Object.keys(response.headers)).to.deep.include("set-cookie");
	      expect(response.body).to.have.property("data");
	      assert.isObject(response.body.data);
	      const userFixture = fixtures.users_fixed
	        .map(
	          ({ firebaseSessionToken, secret, ...RestUserdata }) => RestUserdata
	        )
	        .filter((user) => user.name === "TEST_SERVICE")[0];
	      expect(response.body.data)
	        .to.include(userFixture);
      } catch (error) {
        throw error;
      }
      const hats = new HttpAuthTestSenderLogin(LOGIN);
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200);
      hats.expectedResponse.checkResponse(response.body, {data: true});
      return;
    });
    it("POST login-with-secret as Customer User works", async () => {
      const hats = new HttpAuthTestSenderLogin(LOGIN_AS_USER);
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200);
      hats.expectedResponse.checkResponse(response.body, {data: true});
      return;
    });
    it("POST login-with-secret as Vendor works", async () => {
      const hats = new HttpAuthTestSenderLogin(LOGIN_AS_VENDOR);
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200);
      hats.expectedResponse.checkResponse(response.body, {data: true});
      return;
    });
    it("POST login-with-secret as Delivery Partner works", async () => {
      const hats = new HttpAuthTestSenderLogin(LOGIN_AS_DELIVERY_PARTNER);
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200);
      hats.expectedResponse.checkResponse(response.body, {data: true});
      return;
    });
    it("GET logged-in returns true when authenticated", async () => {
      const hats = new HttpAuthTestSenderLogin(IS_LOGGED_IN);
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200);
      hats.expectedResponse.checkResponse(response.body);
    });
    it("GET logged-in returns false when not signed in", async () => {
      // supertest(sails.hooks.http.app)
      //   .get("/api/v1/admin/logged-in")
      //   .set("Cookie", "")
      //   .expect(200, (errs, response, body) => {
      //     if (errs) {
      //       console.warn(errs);
      //       throw errs;
      //     }
      //     expect(response.statusCode).to.equal(200);
      //     expect(response._body).to.deep.equal({ data: false });
      //     return;
      //   });

      const hats = new HttpAuthTestSenderLogin(IS_LOGGED_IN_UNAUTHENTICATED);
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200);
      hats.expectedResponse.checkResponse(response.body);
    });
  });
});
