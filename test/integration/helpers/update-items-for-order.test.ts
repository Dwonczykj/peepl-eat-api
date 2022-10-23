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
import { sailsVegi } from "../../../api/interfaces/iSails.js";

declare var User: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var Order: any;
declare var sails: sailsVegi;

describe("helpers.updateItemsForOrder", async () => {
  const todayName = getTodayDayName(0);
  const tomorrowName = getTodayDayName(1);
  const dayAfterTomorrowName = getTodayDayName(2);
  it("can update items on an order", async () => {
    const delvId = uuidv4();
    // const currentUser = await User.findOne({
    //   name: "TEST_USER",
    // }).populate("deliveryPartner");
    // const deliveryPartner = currentUser.deliveryPartner;
    const _parentOrder: OrderType = await Order.create(
      DEFAULT_NEW_ORDER_OBJECT(fixtures, {
        deliveryId: delvId,
        deliveryPartnerAccepted: true,
        deliveryPartnerConfirmed: true,
        paymentStatus: "paid",
        completedFlag: "",
      })
    ).fetch();
    const parentOrder:OrderType = await Order.findOne(_parentOrder.id).populate('items');

    expect(parentOrder.items).to.have.lengthOf(3);
    const updateItemsResult =
      await sails.helpers.updateItemsForOrder.with({
        orderId: parentOrder.publicId,
        customerWalletAddress: parentOrder.customerWalletAddress,
        retainItems: [parentOrder.items[0].id],
        removeItems: parentOrder.items.filter(item => item.id !== parentOrder.items[0].id).map(item => item.id)
      });

    expect(updateItemsResult).to.have.property("data");
    expect(updateItemsResult.data).to.have.property("validRequest");
    expect(updateItemsResult.data.validRequest).to.equal(true);
    expect(updateItemsResult.data).to.have.property("orderId");
    if(updateItemsResult.data.validRequest){
      expect(updateItemsResult.data).to.have.property("orderId");
      expect(updateItemsResult.data).to.have.property("calculatedOrderTotal");
      expect(updateItemsResult.data).to.have.property("paymentIntentID");
    }

  });
  it("returns invalid request when retain items and remove items dont sum up to current order items", async () => {

    const delvId = uuidv4();
    // const currentUser = await User.findOne({
    //   name: "TEST_USER",
    // }).populate("deliveryPartner");
    // const deliveryPartner = currentUser.deliveryPartner;
    const _parentOrder: OrderType = await Order.create(
      DEFAULT_NEW_ORDER_OBJECT(fixtures, {
        deliveryId: delvId,
        deliveryPartnerAccepted: true,
        deliveryPartnerConfirmed: true,
        paymentStatus: "paid",
        completedFlag: "",
      })
    ).fetch();
    const parentOrder: OrderType = await Order.findOne(
      _parentOrder.id
    ).populate("items");

    expect(parentOrder.items).to.have.lengthOf(3);
    const updateItemsResult = await sails.helpers.updateItemsForOrder.with({
      orderId: parentOrder.publicId,
      customerWalletAddress: parentOrder.customerWalletAddress,
      retainItems: [parentOrder.items[0].id],
      removeItems: [parentOrder.items[2].id],
    });

    expect(updateItemsResult).to.have.property("data");
    expect(updateItemsResult.data).to.have.property("validRequest");
    expect(updateItemsResult.data.validRequest).to.equal(false);
    expect(updateItemsResult.data).to.not.have.property("orderId");
  });
});
