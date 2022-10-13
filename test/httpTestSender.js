var supertest = require("supertest");
const util = require('util');
const { envConfig, callAuthActionWithCookie } = require("./utils");
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/

class ExpectResponse {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    this._EXPECTED_RESPONSE = expectResponse;
    this._send = sendData;
    this._expectedResposeWithUpdates = _.cloneDeep(this._EXPECTED_RESPONSE);
    this.expectedResponseCb = expectResponseCb;
    this.expectStatusCode = expectStatusCode;
    this.payloadRequestedWith = this._send;
  }

  get EXPECTED_RESPONSE() {
    // ~ https://code.tutsplus.com/articles/the-best-way-to-deep-copy-an-object-in-javascript--cms-39655
    return _.cloneDeep(this._EXPECTED_RESPONSE);
  }
  get expectedResposeWithUpdates() {
    return _.cloneDeep(this._expectedResposeWithUpdates);
  }
  get send() {
    return _.cloneDeep(this._send);
  }

  // ~ https://masteringjs.io/tutorials/fundamentals/parameters#:~:text=JavaScript%2C%20by%20default%2C%20does%20not%20support%20named%20parameters.,even%20if%20you%20have%20default%20values%20set%20up.
  // sendWith({ updatedPostDataWith = {}, updatedPostDataWithOutKeys = [] } = {}) {
  sendWith(updatedPostDataWith, updatedPostDataWithOutKeys = []) {
    assert.isObject(updatedPostDataWith, "updatedPostDataWith is an object");
    assert.isArray(
      updatedPostDataWithOutKeys,
      "updatedPostDataWithOutKeys is an array"
    );
    
    let send = this.send;
    for (let k of updatedPostDataWithOutKeys) {
      delete send[k];
      delete this._expectedResposeWithUpdates[k];
    }
    this._expectedResposeWithUpdates = {
      ...this._expectedResposeWithUpdates,
      ...updatedPostDataWith,
    };
    this.payloadRequestedWith = {
      ...send,
      ...updatedPostDataWith,
    };
    return this.payloadRequestedWith;
  }

  async checkResponse(response) {
    expect(response.statusCode).to.equal(
      this.expectStatusCode,
      `[${response.body.code}] -> response.body: ${util.inspect(response.body, {
        depth: null,
      })} with trace: ${util.inspect(response.body.traceRef, {
        depth: null,
      })}`
    );
    if(this.expectedResponseCb){
      await this.expectedResponseCb(response, this.payloadRequestedWith);
    }
  }

  checkResponseExpectedObject(responseBody, overrideExpectedResponse = null) {
    let expectedResponse =
      overrideExpectedResponse || this.expectedResposeWithUpdates;

    for (var prop of Object.keys(expectedResponse)) {
      expect(responseBody).to.have.property(prop);
    }

    if(this.customChecks){
      expectedResponse = this.customChecks({ responseBody, expectedResponse });
    }

    expect(responseBody).to.deep.equal(expectedResponse);
  }
}

class HttpTestSender {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
    expectResponseChecker = ExpectResponse,
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    this.ACTION_PATH = ACTION_PATH;
    this.ACTION_NAME = ACTION_NAME;
    this.HTTP_TYPE = HTTP_TYPE;
    const relUrl = `${this.ACTION_PATH}/${this.ACTION_NAME}`;
    const baseUrl = !relUrl
      ? `/api/v1/${this.ACTION_PATH}/${this.ACTION_NAME}`
      : `/api/v1/${relUrl}`;
    this.baseUrl = baseUrl;
    if (HTTP_TYPE.toLowerCase() === "get") {
      this.httpCall = () => supertest(sails.hooks.http.app).get(baseUrl);
    } else if (HTTP_TYPE.toLowerCase() === "post") {
      this.httpCall = () => supertest(sails.hooks.http.app).post(baseUrl);
    } else if (HTTP_TYPE.toLowerCase() === "all") {
      this.httpCall = () => supertest(sails.hooks.http.app).get(baseUrl);
    } else {
      throw new Error(`httpType of ${HTTP_TYPE} not implemented for tests.`);
    }
    this._expectedResponse = new expectResponseChecker({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
      expectResponseCb,
      expectStatusCode,
    });
  }

  get expectedResponse() {
    return this._expectedResponse;
  }

  get expectedResponseObjectWithUpdates() {
    return this._expectedResponse.expectedResposeWithUpdates;
  }

  makeCallWith(cookie) {
    return async (updatedPostDataWith, updatedPostDataWithOutKeys = []) => {
      const _sw = this.expectedResponse.sendWith(
        updatedPostDataWith,
        updatedPostDataWithOutKeys
      );
      
      if (this.HTTP_TYPE.toUpperCase() === "GET" && _sw){
        console.log(
          "We are going to add query params to get: " + util.inspect(_sw, {depth: 1})
        );

      }

      const _makeCall = () =>
        this.HTTP_TYPE.toUpperCase() === "GET"
          ? this.httpCall().query(_sw)
          : this.httpCall().send(_sw);
      
      const response = _makeCall()
        .set("Cookie", cookie)
        .set("Accept", "application/json");


      console.log(
        `Supertest: -> ${response.method} ${
          response.url
        }`
      );

      if (response.statusCode === 400 || response.statusCode >= 402) {
        // we might want to expect a 401
        // eslint-disable-next-line no-console
        console.warn(
          `(${this.HTTP_TYPE} ${this.baseUrl})->[${response.statusCode}]: ` +
            `body: ${util.inspect(response.body, { depth: null })}\n` +
            `request payload: ${util.inspect(_sw, { depth: null })}\n`
        );
      }
      return response;
    };
  }
}

class HttpAuthTestSender extends HttpTestSender {
  constructor({
    HTTP_TYPE = "get",
    ACTION_PATH = "",
    ACTION_NAME = "",
    useAccount = "TEST_SERVICE",
    sendData = {},
    expectResponse = {},
    expectResponseChecker = ExpectResponse,
    expectResponseCb = async (response, requestPayload) => {},
    expectStatusCode = 200,
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
      expectResponseChecker,
      expectResponseCb,
      expectStatusCode,
    });
    this.useAccount = useAccount;
  }

  async makeAuthCallWith(
    updatedPostDataWith,
    updatedPostDataWithOutKeys = [],
    otherLoginDetails = {}
  ) {
    if (!otherLoginDetails && !!this.useAccount) {
      const userDetails = await User.findOne({ name: this.useAccount }); //.populate('vendor&courier');
      const bespokeUserDetails = {
        email: userDetails.email,
        phoneNoCountry: userDetails.phoneNoCountry,
        phoneCountryCode: userDetails.phoneCountryCode,
        name: userDetails.name,
        isSuperAdmin: userDetails.isSuperAdmin,
        role: userDetails.role,
        // vendor: userDetails.vendor,
        // vendorRole: userDetails.vendorRole,
        firebaseSessionToken: userDetails.firebaseSessionToken,
        secret: envConfig[`test_${userDetails.name}_secret`],
      };
      otherLoginDetails = bespokeUserDetails;
    }
    const self = this;
    return this.useAccount !== "TEST_UNAUTHENTICATED"
      ? callAuthActionWithCookie(
          async (cookie) =>
            self.makeCallWith(cookie)(
              updatedPostDataWith,
              updatedPostDataWithOutKeys
            ),
          false,
          otherLoginDetails || null
        )
      : await self.makeCallWith("")(
          updatedPostDataWith,
          updatedPostDataWithOutKeys
        );
  }
}

module.exports = {
  HttpAuthTestSender,
  ExpectResponse,
};
