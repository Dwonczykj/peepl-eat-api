/* eslint-disable no-console */
// test/integration/controllers/Vendors/view-all-vendors.test.js
const { expect, assert } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
var supertest = require("supertest");
const { login } = require("../../../utils");
const {fixtures} = require("../../../../scripts/build_db");
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require("../../../httpTestSender");
var util = require("util");

// require("ts-node/register");

class ExpectResponseLogin extends ExpectResponse {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PREFIX = "/api/v1",
    ACTION_PATH = "",
    ACTION_NAME = "",
    useAccount = "TEST_SERVICE",
    sendData = {},
    expectResponse = {},
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    super({
      HTTP_TYPE,
      ACTION_PREFIX,
      ACTION_PATH,
      ACTION_NAME,
      useAccount,
      sendData,
      expectResponse,
      ExpectResponseLogin,
      expectResponseCb,
      expectStatusCode,
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

const IS_LOGGED_IN = (fixtures) => { return {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in",
  sendData: {
    
  },
  expectResponse: {
    authenticated: true,
  },
  expectStatusCode: 200,
  expectResponseCb: async (response) => {
    expect(response.body).to.deep.equal({
      authenticated: true
    });
    return;
  },
};};
const IS_LOGGED_IN_UNAUTHENTICATED = (fixtures) => { return {
  useAccount: "TEST_UNAUTHENTICATED",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in",
  sendData: {},
  expectResponse: {
    authenticated: false,
  },
  expectStatusCode: 200,
  expectResponseCb: async (response) => {
    expect(response.body).to.deep.equal({
      authenticated: false,
    });
    return;
  },
};};
// const VIEW_LOGIN = (fixtures) => { return {
//   useAccount: "TEST_UNAUTHENTICATED",
//   HTTP_TYPE: "get",
//   ACTION_PATH: "admin",
//   ACTION_NAME: "login",
//   sendData: {},
//   expectResponse: {
    
//   },
// };
const LOGIN = (fixtures) => { return {
  useAccount: "TEST_SERVICE",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {
    
  },
  expectResponse: {
    data: true,
  },
  expectStatusCode: 200,
  expectResponseCb: async (responseBody) => {
    
    return;
  },
};};
const LOGIN_AS_USER = (fixtures) => { return {
  useAccount: "TEST_USER",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {},
  expectResponse: {
    data: true,
  },
  expectStatusCode: 200,
  expectResponseCb: async (responseBody) => {
    
    return;
  },
};};
const LOGIN_AS_VENDOR = (fixtures) => { return {
  useAccount: "TEST_VENDOR",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {},
  expectResponse: {
    data: true,
  },
  expectStatusCode: 200,
  expectResponseCb: async (responseBody) => {
    
    return;
  },
};};
const LOGIN_AS_DELIVERY_PARTNER = (fixtures) => { return {
  useAccount: "TEST_DELIVERY_PARTNER",
  HTTP_TYPE: "get",
  ACTION_PATH: "admin",
  ACTION_NAME: "logged-in", //handler will log us in with useAccount
  sendData: {},
  expectResponse: {
    data: true,
  },
  expectStatusCode: 200,
  expectResponseCb: async (responseBody) => {
    
    return;
  },
};};


describe("Authentication Tests", () => {
  describe("Login Tests", () => {
    it("GET view-login", (done) => {
      supertest(sails.hooks.http.app)
        .get("/admin/login")
        .set("Cookie", "")
        .expect(200)
        .then((response) => {
          expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
          );
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
	        
	      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
        );
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
      const hats = new HttpAuthTestSenderLogin(LOGIN(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      hats.expectedResponse.checkResponse(response.body, {authenticated: true});
      return;
    });
    it("POST login-with-secret as Customer User works", async () => {
      const hats = new HttpAuthTestSenderLogin(LOGIN_AS_USER(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      hats.expectedResponse.checkResponse(response.body, {
        authenticated: true,
      });
      return;
    });
    it("POST login-with-secret as Vendor works", async () => {
      const hats = new HttpAuthTestSenderLogin(LOGIN_AS_VENDOR(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      hats.expectedResponse.checkResponse(response.body, {data: true});
      return;
    });
    it("POST login-with-secret as Delivery Partner works", async () => {
      const hats = new HttpAuthTestSenderLogin(LOGIN_AS_DELIVERY_PARTNER(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      hats.expectedResponse.checkResponse(response.body, {data: true});
      return;
    });
    it("GET logged-in returns true when authenticated", async () => {
      const hats = new HttpAuthTestSenderLogin(IS_LOGGED_IN(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      await hats.expectedResponse.checkResponse(response);
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
      //     expect(response.statusCode).to.equal(200,
      //   `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
      //     depth: null,
      //   })} with trace: ${util.inspect(response.body.traceRef, {
      //     depth: null,
      //   })}`
      // );
      //     expect(response._body).to.deep.equal({ data: false });
      //     return;
      //   });

      const hats = new HttpAuthTestSenderLogin(IS_LOGGED_IN_UNAUTHENTICATED(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      await hats.expectedResponse.checkResponse(response);
    });
  });
  describe("Login-with-password email & password firebase Tests", () => {
    it("Successfully created the dummy user in firebase emulator", async () => {
      const DUMMY_API_KEY = "dummy_firebase_key";
      const postUrlRegisterDummyUser = 
        `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${DUMMY_API_KEY}`;
      // supertest(sails.hooks.http.app)
      //   .get("/api/v1/admin/logged-in")
      //   .set("Cookie", "")
      //   .expect(200, (errs, response, body) => {
      //     if (errs) {
      //       console.warn(errs);
      //       throw errs;
      //     }
      //     expect(response.statusCode).to.equal(200,
      //   `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
      //     depth: null,
      //   })} with trace: ${util.inspect(response.body.traceRef, {
      //     depth: null,
      //   })}`
      // );
      //     expect(response._body).to.deep.equal({ data: false });
      //     return;
      //   });
      //TODO: Ensure the emulator has started in headless mode and get the token from it when trying to auth with phone.
      
    });
    it("Successfully logged in to vegi with dummy user", async () => {
      // supertest(sails.hooks.http.app)
      //   .get("/api/v1/admin/logged-in")
      //   .set("Cookie", "")
      //   .expect(200, (errs, response, body) => {
      //     if (errs) {
      //       console.warn(errs);
      //       throw errs;
      //     }
      //     expect(response.statusCode).to.equal(200,
      //   `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
      //     depth: null,
      //   })} with trace: ${util.inspect(response.body.traceRef, {
      //     depth: null,
      //   })}`
      // );
      //     expect(response._body).to.deep.equal({ data: false });
      //     return;
      //   });
      
      //TODO: Ensure the emulator has started in headless mode and get the token from it when trying to auth with phone.
      const hats = new HttpAuthTestSenderLogin(IS_LOGGED_IN_UNAUTHENTICATED(fixtures));
      const response = await hats.makeAuthCallWith({}, []);
      expect(response.statusCode).to.equal(200,
          `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
            depth: null,
          })} with trace: ${util.inspect(response.body.traceRef, {
            depth: null,
          })}`
      );
      await hats.expectedResponse.checkResponse(response);
    });
  });

});
