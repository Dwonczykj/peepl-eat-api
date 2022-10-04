/* eslint-disable no-undef */
// ./test/integration/models/User.test.js

var util = require('util');

describe('User (model)', () => {

  describe('Can get a user', () => {
    it('should return 1 user', (done) => {
      User.find({ email: 'service.account@example.com' })
                .then((bestStudents) => {
                  if (bestStudents.length !== 1) {
                    return done(new Error(
                            'Should return exactly 1 user.  ' +
                            'But instead, got: ' + util.inspect(bestStudents, { depth: null }) + ''
                    ));
                  }

                  return done();

                })
                .catch(done);
    });
  });

});
