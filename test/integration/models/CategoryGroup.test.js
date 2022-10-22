const { assert, expect } = require('chai');
var util = require('util');

describe('CategoryGroup (model)', () => {
  describe('Can get a categoryGroup', () => {
    it('should return 23 categoryGroups', (done) => {
      CategoryGroup.find()
                .then((categoryGroups) => {
                  if (categoryGroups.length !== 23) {
                    return done(new Error(
                            'Should return exactly 23 categoryGroups.  ' +
                            'But instead, got: ' + util.inspect(categoryGroups, { depth: null }) + ''
                    ));
                  }
                  return done();

                })
                .catch(done);
    });
  });
  describe('Can get a categoryGroup', () => {
    it('should return 1 categoryGroup', (done) => {
      CategoryGroup.find({ name: 'Italian' })
                .then((categoryGroups) => {
                  if (categoryGroups.length !== 1) {
                    return done(new Error(
                            'Should return exactly 1 categoryGroup.  ' +
                            'But instead, got: ' + util.inspect(categoryGroups, { depth: null }) + ''
                    ));
                  }
                  return done();

                })
                .catch(done);
    });
  });
});
