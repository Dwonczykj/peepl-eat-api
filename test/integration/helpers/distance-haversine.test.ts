import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
// var util = require("util");
// import moment from "moment";
// const { fixtures } = require('../../../scripts/build_db');
// import { v4 as uuidv4 } from 'uuid';
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';
import { Coordinate } from '../../../scripts/google-maps';

declare var sails: sailsVegi;

describe("helpers.distanceHaversine", () => {
  it("can calculate a distance between 2 coordinates", async () => {
    const pointA: Coordinate = { // vegi
      lat: 53.3957072,
      lng: -2.9816823,
    };

    const pointB: Coordinate = { // Bagels
      lat: 53.398995099450225,
      lng: -2.9779334269436823,
    };

    const distance = await sails.helpers.distanceHaversine.with({
      pointA: pointA,
      pointB: pointB,
    });

    assert.isNumber(distance);

    expect(distance).to.equal(442.0875336955931);

    return;
  });
});
