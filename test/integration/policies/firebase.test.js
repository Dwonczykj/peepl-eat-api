// ./test/integration/models/User.test.js

var util = require('util');
var chai = require('chai');
var assert = chai.assert;

describe('api/policies', () => {

    describe('Can require firebase service account', () => {
        it('should load service account details', (done) => {
            try {
                var serviceAccount = require('../../../config/vegiliverpool-firebase-adminsdk-4dfpz-8f01f888b3.json');
                assert(!!serviceAccount);
            } catch (error) {
                return done(error);
            }
            return done();
        });
    });

});
