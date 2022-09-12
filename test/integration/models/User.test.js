// ./test/integration/models/User.test.js

var util = require('util');

describe('User (model)', function () {

    describe('Can get a user', function () {
        it('should return 1 user', function (done) {
            User.find({ email: 'service.account@example.com' })
                .then(function (bestStudents) {
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