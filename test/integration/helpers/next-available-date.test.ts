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
import { NextAvailableDateHelperReturnType } from "../../../api/helpers/next-available-date";

declare var User: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

describe("helpers.nextAvailableDate", async () => {
  const todayName = getTodayDayName(0);
  const tomorrowName = getTodayDayName(1);
  const dayAfterTomorrowName = getTodayDayName(2);
  it("can get next date for new test vendor", async () => {
    // const response = await login();
    // const user = await User.findOne({ name: response.body.name });

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

    const nextAvail: NextAvailableDateHelperReturnType =
      await sails.helpers.nextAvailableDate.with({
        fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
      });

    expect(nextAvail).to.have.property("nextAvailableDate");
    expect(nextAvail).to.have.property("nextAvailableOpeningHours");

    const weekdayToDtStr = getNextWeekday(tomorrowName);

    expect(nextAvail.nextAvailableDate).to.equal(weekdayToDtStr);
  });
  it("gets the following date as next date when past cutoff", async () => {

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
      orderCutoff: moment.utc().add(-5, "minutes").format(timeStrFormat),
      slotLength: 60,
      bufferLength: 30,
      maxOrders: 50,
    });

    const nextAvail: NextAvailableDateHelperReturnType =
      await sails.helpers.nextAvailableDate.with({
        fulfilmentMethodIds: [vendorsDelvFulfMethod.id],
      });

    expect(nextAvail).to.have.property("nextAvailableDate");
    expect(nextAvail).to.have.property("nextAvailableOpeningHours");

    const weekdayToDtStr = getNextWeekday(dayAfterTomorrowName);

    expect(nextAvail.nextAvailableDate).to.equal(weekdayToDtStr);
  });
});
