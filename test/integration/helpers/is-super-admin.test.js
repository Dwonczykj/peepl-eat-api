/* eslint-disable no-undef */
// ./test/integration/helpers/is-super-admin.test.js
// var util = require("util");
const { expect } = require('chai'); // ~ https://www.chaijs.com/api/bdd/
const { login } = require('../../utils');

describe('helpers.isSuperAdmin', () => {
  it('returns true when logged in as super admin', async () => {
    const response = await login();
    const user = await User.findOne({ name: response.body.data.name });
    const result = sails.helpers.isSuperAdmin(user.id);
    expect(result).to.equal(true);
  });
});
