import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
import { sailsVegi } from '../../../api/interfaces/iSails';
declare var sails: sailsVegi;

const PPL_VALUE_IN_PENCE = 10;
const VEGI_EATS_REWARD = 0.05;

describe('helpers.calculatePplReward() for a vegiEats order', () => {
  it('can correctly calculate reward for an amount', async () => {
    const AMOUNT = 1000;
    const result = await sails.helpers.calculatePplReward.with({
      amount: AMOUNT,
      orderType: 'vegiEats'
    });
    assert.isNotEmpty(result);
    expect(result).to.have.property('data');
    expect(sails.config.custom.PPLTokenValueInPence).to.equal(
      PPL_VALUE_IN_PENCE
    );
    expect(sails.config.custom.vegiEatsRewardPcnt).to.equal(VEGI_EATS_REWARD);
    
    expect(result.data).to.equal(
      (VEGI_EATS_REWARD * AMOUNT) / PPL_VALUE_IN_PENCE
    );
  });
});
