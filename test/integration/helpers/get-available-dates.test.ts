import { expect, assert } from "chai"; // ~ https://www.chaijs.com/api/bdd/
const { login } = require("../../utils");
import util from "util";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
const { fixtures } = require("../../../scripts/build_db.js");
import { DEFAULT_NEW_VENDOR_OBJECT } from "../controllers/vendors/defaultVendor.js";
import { DEFAULT_NEW_DELIVERY_PARTNER_OBJECT } from "../controllers/deliveryPartners/defaultDeliveryPartner";
import { DEFAULT_NEW_ORDER_OBJECT } from "../controllers/orders/defaultOrder.js";
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
} from "../../../scripts/utils";
import {
  DaysOfWeek,
  iSlot,
  TimeWindow,
} from "../../../api/interfaces/vendors/slot";
import { createVendorWithOpeningHours } from "./db-utils";
import { AvailableDateOpeningHours } from '../../../api/helpers/get-available-dates';

declare var Order: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

describe("helpers.getAvailableDates", async () => {
  const todayName = getTodayDayName(0);
  const tomorrowName = getTodayDayName(1);
  const dayAfterTomorrowName = getTodayDayName(2);
  it("can get available days of week and special dates for new test vendor", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "12:30",
            endTime: "16:30",
            date: moment.utc(),
          }),
        ],
        [tomorrowName, dayAfterTomorrowName]
      );

    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const nextAvail: AvailableDateOpeningHours =
      await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
      });

    assert.isObject(nextAvail);
    
    const availableDates = Object.keys(nextAvail);

    const removeToday = moment.utc().format(dateStrFormat);
    const expectAvailDateStrs = usedWeekdays
      .map((wd) => getNextWeekday(wd as DaysOfWeek))
      .filter((dt) => dt !== removeToday);

    expect(availableDates).to.deep.equal(expectAvailDateStrs);
  });
  it("ignores tomorrow's date in returned dates when past cutoff", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "12:30",
            endTime: "14:30",
            date: moment.utc(),
          }),
        ],
        [tomorrowName, dayAfterTomorrowName]
      );
    const MAX_ORDERS = 2;
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(-5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: MAX_ORDERS,
    });
    
    const nextAvail: AvailableDateOpeningHours =
      await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
      });

    assert.isObject(nextAvail);

    const availableDates = Object.keys(nextAvail);

    const removeToday = moment.utc().format(dateStrFormat);
    const removeTomorrow = moment.utc().add(1, "days").format(dateStrFormat);
    const expectAvailDateStrs = usedWeekdays
      .map((wd) => getNextWeekday(wd as DaysOfWeek))
      .filter((dt) => dt !== removeToday && dt !== removeTomorrow);

    expect(availableDates).to.deep.equal(expectAvailDateStrs);
  });
  it("eligible dates includes a week today in returned dates when past cutoff for todays delivery date", async () => {
    const { vendorsDelvFulfMethod, vendorsDeliveryOpeningHours, usedWeekdays } =
      await createVendorWithOpeningHours(
        fixtures,
        [
          new TimeWindow({
            startTime: "15:30",
            endTime: "17:30",
            date: moment.utc(),
          }),
        ],
        [todayName, tomorrowName, dayAfterTomorrowName]
      );
    const MAX_ORDERS = 2;
    await FulfilmentMethod.update(vendorsDelvFulfMethod.id).set({
      orderCutoff: moment.utc().add(-2, "hours").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: MAX_ORDERS,
    });
    
    const nextAvail: AvailableDateOpeningHours =
      await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
      });

    assert.isObject(nextAvail);

    const availableDates = Object.keys(nextAvail);

    const removeToday = moment.utc().format(dateStrFormat);
    const includeNextWeekToday = moment
      .utc()
      .add(7, 'days')
      .format(dateStrFormat);
    const removeTomorrow = moment.utc().add(1, "days").format(dateStrFormat);
    const expectAvailDateStrs = usedWeekdays
      .map((wd) => getNextWeekday(wd as DaysOfWeek))
      .filter((dt) => dt !== removeToday && dt !== removeTomorrow);
    expectAvailDateStrs.push(includeNextWeekToday);

    expect(availableDates).to.deep.members(expectAvailDateStrs);
  });
  it("returns no dates when no fulfilmentIds passed", async () => {
    const nextAvail = await sails.helpers.getAvailableDates.with({
      fulfilmentMethodIds: [],
    });
    
    assert.isObject(nextAvail);
    assert.isEmpty(nextAvail);
  });
  it("returns no dates when bad fulfilmentIds passed", async () => {

    const nextAvail = await sails.helpers.getAvailableDates.with({
      fulfilmentMethodIds: [100000],
    });

    assert.isObject(nextAvail);
    assert.isEmpty(nextAvail);
  });
});
