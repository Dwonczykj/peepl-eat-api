import { expect, assert } from 'chai'; // ~ https://www.chaijs.com/api/bdd/
// var util = require("util");
// import moment from "moment";
// const { fixtures } = require('../../../scripts/build_db');
// import { v4 as uuidv4 } from 'uuid';
import { SailsModelType, sailsVegi } from '../../../api/interfaces/iSails';
import { Coordinate } from '../../../scripts/google-maps';

declare var sails: sailsVegi;

describe("helpers.distanceHaversine", () => {
  it("can calculate an end coordinate from start on a Northern bearing", async () => {
    const end = await sails.helpers.distanceViaBearing.with({
      point: {
        lat: 53.3957072,
        lng: -2.9816823,
      },
      bearing: 0.0,
      distance: 0.5,
    });

    expect(end).to.be.an('object').that.includes.all.keys(['lat', 'lng'] as (keyof Coordinate)[]);

    expect(end).to.deep.equal({
      lat: 53.4002038080296,
      lng: -2.9816823,
    });

    return;
  });
  it("can calculate an end coordinate from start on an Easterly bearing", async () => {
    const end = await sails.helpers.distanceViaBearing.with({
      point: {
        lat: 53.3957072,
        lng: -2.9816823,
      },
      bearing: 90.0,
      distance: 0.5,
    });

    expect(end).to.be.an('object').that.includes.all.keys(['lat', 'lng'] as (keyof Coordinate)[]);

    expect(end).to.deep.equal({
      lat: 53.395706962449374,
      lng: -2.9741412620097085,
    });

    return;
  });
  
  it("can calculate an end coordinate from start on an Westerly bearing using -ve bearing", async () => {
    const end = await sails.helpers.distanceViaBearing.with({
      point: {
        lat: 53.3957072,
        lng: -2.9816823,
      },
      bearing: -90.0,
      distance: 0.5,
    });

    expect(end).to.be.an('object').that.includes.all.keys(['lat', 'lng'] as (keyof Coordinate)[]);

    expect(end).to.deep.equal({
      lat: 53.395706962449374,
      lng: -2.9892233379902913,
    });

    return;
  });
});
