// ./test/integration/models/User.test.js

var util = require('util');
var chai = require('chai');
var assert = chai.assert;

describe('api/policies', () => {

  describe('Can require firebase service account', () => {
    it('should load service account details', (done) => {
      try {
        var serviceAccount = require('../../../config/we-are-vegi-app-firebase-adminsdk-69yvy-26ba373cd9.json');
        assert(!!serviceAccount);
      } catch (error) {
        return done(error);
      }
      return done();
    });
  });

});
