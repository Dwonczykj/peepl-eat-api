const { assert, expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
// var supertest = require("supertest");
// const _ = require('lodash');
var util = require('util');
const moment = require('moment/moment');
require('ts-node/register');
const { fixtures } = require('../../../../scripts/build_db');
const { getNextWeekday } = require('../../../utils');
const {
  HttpAuthTestSender,
  ExpectResponse,
} = require('../../../httpTestSender');

const {
  DEFAULT_NEW_ORDER_OBJECT,
  ExpectResponseOrder,
  HttpAuthTestSenderOrder,
} = require('./defaultOrder');

const { v4: uuidv4 } = require('uuid');

const VIEW_ALL_ORDERS_ACCEPTED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      acceptanceStatus: 'accepted', //['accepted', 'rejected', 'pending']
      timePeriod: 'all', //['upcoming', 'past', 'all']
    },
    expectResponse: fixtures.orders.filter((order) => order.id === 2)[0],
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_REJECTED = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      acceptanceStatus: 'rejected', //['accepted', 'rejected', 'pending']
      timePeriod: 'all', //['upcoming', 'past', 'all']
    },
    expectResponse: fixtures.orders.filter((order) => order.id === 3)[0],
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_PENDING = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      acceptanceStatus: 'pending', //['accepted', 'rejected', 'pending']
      timePeriod: 'all', //['upcoming', 'past', 'all']
    },
    expectResponse: fixtures.orders.filter((order) => order.id === 1)[0], //TODO: call to create or setup in fixtures
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_DEFAULT = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      timePeriod: 'all', //['upcoming', 'past', 'all']
    },
    expectResponse: fixtures.orders,
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_UPCOMING = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      timePeriod: 'upcoming', //['upcoming', 'past', 'all']
    },
    expectResponse: fixtures.orders.filter((order) => {
      return moment.utc(order.fulfilmentSlotFrom).isAfter(moment.utc());
    }),
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_PAST = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      timePeriod: 'past', //['upcoming', 'past', 'all']
    },
    expectResponse: fixtures.orders.filter((order) => {
      return moment.utc(order.fulfilmentSlotFrom).isSameOrBefore(moment.utc());
    }),
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_NON_ADMIN = (fixtures) => {
  return {
    useAccount: 'TEST_VENDOR',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      acceptanceStatus: 'accepted', //['accepted', 'rejected', 'pending']
      timePeriod: 'all', //['upcoming', 'past', 'all']
    },
    expectResponse: null,
    expectStatusCode: 200, //TODO: Authenticate this route and change to 401
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};
const VIEW_ALL_ORDERS_AS_ADMIN = (fixtures) => {
  return {
    useAccount: 'TEST_SERVICE',
    HTTP_TYPE: 'get',
    ACTION_PREFIX: '',
    ACTION_PATH: 'admin',
    ACTION_NAME: 'orders',
    sendData: {
      acceptanceStatus: 'accepted', //['accepted', 'rejected', 'pending']
      timePeriod: 'all', //['upcoming', 'past', 'all']
    },
    expectResponse: null,
    expectStatusCode: 200,
    expectResponseCb: async (response, requestPayload) => {
      return;
    },
  };
};

describe(`${VIEW_ALL_ORDERS_ACCEPTED(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all accepted orders', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_ACCEPTED(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_REJECTED(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all rejected orders', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_REJECTED(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_PENDING(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all pending orders', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_PENDING(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_DEFAULT(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all orders with no status parameter set', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_DEFAULT(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_UPCOMING(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all upcoming orders with no status parameter set', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_UPCOMING(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_PAST(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all past orders with no status parameter set', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(VIEW_ALL_ORDERS_PAST(fixtures));
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_AS_ADMIN(fixtures).ACTION_NAME}()`, () => {
  it('successfully gets all orders when logged in as admin', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_AS_ADMIN(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);

      expect(response.statusCode).to.equal(
        200,
        `[${response.body.code}] -> response.body: ${util.inspect(
          response.body,
          {
            depth: null,
          }
        )} with trace: ${util.inspect(response.body.traceRef, {
          depth: null,
        })}`
      );
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
describe(`${VIEW_ALL_ORDERS_NON_ADMIN(fixtures).ACTION_NAME}()`, () => {
  it('fails to get any orders when logged in as non-admin', async () => {
    try {
      const hats = new HttpAuthTestSenderOrder(
        VIEW_ALL_ORDERS_NON_ADMIN(fixtures)
      );
      const response = await hats.makeAuthCallWith({}, []);
      await hats.expectedResponse.checkResponse(response);
    } catch (errs) {
      console.warn(errs);
      throw errs;
    }
  });
});
