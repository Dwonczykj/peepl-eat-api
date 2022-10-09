var supertest = require("supertest");
const { envConfig, callAuthActionWithCookie } = require("./utils");
const { assert, expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/

class ExpectResponse {
  constructor({
    // eslint-disable-next-line no-unused-vars
    HTTP_TYPE = "get",
    // eslint-disable-next-line no-unused-vars
    ACTION_PATH = "",
    // eslint-disable-next-line no-unused-vars
    ACTION_NAME = "",
    sendData = {},
    expectResponse = {},
  }) {
    this._EXPECTED_RESPONSE = expectResponse;
    this._send = sendData;
    this._expectedResposeWithUpdates = _.cloneDeep(this._EXPECTED_RESPONSE);
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
    assert.containsAllKeys(
      this.EXPECTED_RESPONSE,
      Object.keys(updatedPostDataWith),
      ""
    );
    assert.containsAllKeys(
      this.EXPECTED_RESPONSE,
      Object.keys(updatedPostDataWithOutKeys),
      ""
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
    return {
      ...send,
      ...updatedPostDataWith,
    };
  }

  checkResponse(responseBody, overrideExpectedResponse = null) {
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
  }) {
    const relUrl = `${this.ACTION_PATH_ORDERS}/${this.ACTION_NAME_CREATE_ORDER}`;
    const baseUrl = !relUrl
      ? `/api/v1/${this.ACTION_PATH_ORDERS}/${this.ACTION_NAME_CREATE_ORDER}`
      : `/api/v1/${this.relUrl}`;
    if (HTTP_TYPE.toLowerCase() === "get") {
      this.httpCall = async () =>
        await supertest(sails.hooks.http.app).get(baseUrl);
    } else if (HTTP_TYPE.toLowerCase() === "post") {
      this.httpCall = async () =>
        await supertest(sails.hooks.http.app).post(baseUrl);
    } else if (HTTP_TYPE.toLowerCase() === "all") {
      this.httpCall = async () =>
        await supertest(sails.hooks.http.app).get(baseUrl);
    } else {
      assert(false, `httpType of ${HTTP_TYPE} not implemented for tests.`);
    }
    this._expectedResponse = expectResponseChecker({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
    });
  }

  get expectedResponse() {
    return this._expectedResponse;
  }

  get expectedResponseObjectWithUpdates() {
    return this._expectedResponse.expectedResposeWithUpdates;
  }

  async makeCallWith(cookie) {
    return (updatedPostDataWith, updatedPostDataWithOutKeys = []) =>
      this.httpCall()
        .send(
          this.expectedResponse.sendWith(
            updatedPostDataWith,
            updatedPostDataWithOutKeys
          )
        )
        .set("Cookie", cookie)
        .set("Accept", "application/json");
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
  }) {
    super({
      HTTP_TYPE,
      ACTION_PATH,
      ACTION_NAME,
      sendData,
      expectResponse,
      expectResponseChecker,
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
    return callAuthActionWithCookie(
      (cookie) =>
        this.makeCallWith(cookie)(
          updatedPostDataWith,
          updatedPostDataWithOutKeys
        ),
      false,
      otherLoginDetails || null
    );
  }
}

module.export = {
  HttpAuthTestSender,
  ExpectResponse,
};
