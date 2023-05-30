import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { login } = require("../../utils");
import moment from "moment";
const { fixtures } = require("../../../scripts/build_db.js");
import {
  getNextWeekday,
  timeStrFormat,
  getTodayDayName,
  dateStrFormat,
  timeStrTzFormat,
  VendorType,
  FulfilmentMethodType,
  OpeningHoursType,
  DeliveryPartnerType,
  OrderType,
  TimePeriodEnumType,
  OrderAcceptedStatusType,
} from "../../../scripts/utils";

import { sailsVegi } from "../../../api/interfaces/iSails";

declare var sails: sailsVegi;


describe("helpers.getOrders()", async () => {
  const timePeriod: TimePeriodEnumType = 'all';
  const acceptanceStatus: OrderAcceptedStatusType = 'pending';
  it(`can get all ${timePeriod} ${acceptanceStatus} orders`, async () => {
    // todo: update orders fixtures by exporting the existing db using the sails script... but dont overwrite test users, parse and add to them if anything...
    
    const orders = await sails.helpers.getOrders.with({
      timePeriod: timePeriod,
      acceptanceStatus: acceptanceStatus,
    },);

    assert.isArray(orders);

  });
});
