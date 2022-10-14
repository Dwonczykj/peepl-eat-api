/* eslint-disable no-undef */
// ./test/integration/helpers/is-super-admin.test.js

const { expect } = require("chai"); // ~ https://www.chaijs.com/api/bdd/
const { login } = require("../../utils");
// var util = require("util");
import moment from "moment";

declare var User: any;
declare var DeliveryPartner: any;
declare var Vendor: any;
declare var FulfilmentMethod: any;
declare var OpeningHours: any;
declare var sails: any;

describe("helpers.calculateOrderTotal", () => {
  it("can calculate a simple order total", async () => {
    const response = await login();
    const user = await User.findOne({ name: response.body.data.name });

    const deliveryStart = "11:00";
    const deliveryEnd = "13:00";
    // create an order with the fulfilment slot set to one that works for DeliveryPartner
    sails.log("hey");

    //todo: init the dp and vendor below and then create a new order for them? Or use DefaultOrderCreators

    const deliveryPartner = await DeliveryPartner.create({
      name: "Test helpers calculateOrderTotal Delivery Partner",
      email: "calculateOrderTotal@sailshelpers.com",
      phoneNumber: "0123456123",
      status: "active",
      deliversToPostCodes: ["L1"],
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      rating: 5,
    });
    // Generate collection/delivery blank opening hours
    var openingHoursDel = [];
    var openingHoursCol = [];
    var weekdays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const delv = await FulfilmentMethod.create({
      deliveryPartner: deliveryPartner,
      methodType: "delivery",
    }).fetch();
    // Create blank opening hours for each day
    weekdays.forEach((weekday) => {
      // Delivery hours
      openingHoursDel.push({
        dayOfWeek: weekday,
        isOpen: true,
        openTime: deliveryStart,
        closeTime: deliveryEnd,
        fulfilmentMethod: delv.id,
      });
      openingHoursDel.push({
        dayOfWeek: weekday,
        isOpen: true,
        openTime: "15:00",
        closeTime: "17:00",
        fulfilmentMethod: delv.id,
      });
    });

    // Add the opening hours to the database
    const newHoursDel = await OpeningHours.createEach(openingHoursDel).fetch();
    const newHoursIDsDel = newHoursDel.map(({ id }) => id);
    await FulfilmentMethod.addToCollection(delv.id, "openingHours").members(
      newHoursIDsDel
    );

    const vendor = await Vendor.create({
      createdAt: 1650878843365,
      updatedAt: 1651529215649,
      name: "Test helpers calculateOrderTotal Vendor",
      type: "restaurant",
      description: "Some test vendor",
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      status: "active",
      phoneNumber: "+447495865614",
      pickupAddressLineOne: null,
      pickupAddressLineTwo: null,
      pickupAddressCity: null,
      pickupAddressPostCode: null,
      costLevel: null,
      rating: 5,
      isVegan: false,
      minimumOrderAmount: 0,
      platformFee: 0,
      collectionFulfilmentMethod: 8,
      deliveryFulfilmentMethod: delv.id,
      deliveryPartner: deliveryPartner.id, // Agile
      products: [],
      vendorCategories: [1], // Cafes
      productCategories: [],
      fulfilmentPostalDistricts: [1, 2], // L1, L2
      users: [],
    }).fetch();

    const result = sails.helpers.calculateOrderTotal.with({
      pickupFromVendor: vendor.id,
      deliverAfter: moment.utc(`${deliveryStart}:00`, "HH:mm:ss"), //moment.utc("01:15:00 PM", "h:mm:ss A")
      deliverBefore: moment.utc(`${deliveryEnd}:00`, "HH:mm:ss"), //moment.utc("01:15:00 PM", "h:mm:ss A")

      deliveryContactName: "Test Delivery John Smith",
      deliveryPhoneNumber: "0746564653",
      deliveryComments: "Bants test comments for delivery instructions",

      deliveryAddressLineOne: "23 SomeLane",
      deliveryAddressLineTwo: "Liverpool",
      deliveryAddressCity: "Liverpool",
      deliveryAddressPostCode: "L1 0AR",
    });
    expect(result).to.be.nonEmpty();
  });
  it("returns no delivery partners when no intersecting slots", async () => {
    const deliveryStart = "11:00";
    const deliveryEnd = "13:00";
    const response = await login();
    const user = await User.findOne({ name: response.body.data.name });
    // create an order with the fulfilment slot set to one that works for DeliveryPartner

    const deliveryPartner = await DeliveryPartner.create({
      name: "Test helpers calculateOrderTotal Delivery Partner 2",
      email: "calculateOrderTotal2@sailshelpers.com",
      phoneNumber: "0123456122",
      status: "active",
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      deliversToPostCodes: ["L1"],
      rating: 5,
    });
    // Generate collection/delivery blank opening hours
    var openingHoursDel = [];
    var openingHoursCol = [];
    var weekdays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const delv = await FulfilmentMethod.create({
      deliveryPartner: deliveryPartner,
      methodType: "delivery",
    }).fetch();
    // Create blank opening hours for each day
    weekdays.forEach((weekday) => {
      // Delivery hours
      // openingHoursDel.push({
      //   dayOfWeek: weekday,
      //   isOpen: true,
      //   openTime: deliveryStart,
      //   closeTime: deliveryEnd,
      //   fulfilmentMethod: delv.id,
      // });
      openingHoursDel.push({
        dayOfWeek: weekday,
        isOpen: true,
        openTime: "15:00",
        closeTime: "17:00",
        fulfilmentMethod: delv.id,
      });
    });

    // Add the opening hours to the database
    const newHoursDel = await OpeningHours.createEach(openingHoursDel).fetch();
    const newHoursIDsDel = newHoursDel.map(({ id }) => id);
    await FulfilmentMethod.addToCollection(delv.id, "openingHours").members(
      newHoursIDsDel
    );

    const vendor = await Vendor.create({
      createdAt: 1650878843365,
      updatedAt: 1651529215649,
      name: "Test helpers calculateOrderTotal Vendor 2",
      type: "restaurant",
      description: "Some test vendor",
      walletAddress: "0xf039CD9391cB28a7e632D07821deeBc249a32410",
      imageUrl:
        "https://vegiapp-1.s3.us-east-1.amazonaws.com/89e602bd-3655-4c01-a0c9-39eb04737663.png",
      status: "active",
      phoneNumber: "+447495865614",
      pickupAddressLineOne: null,
      pickupAddressLineTwo: null,
      pickupAddressCity: null,
      pickupAddressPostCode: null,
      costLevel: null,
      rating: 5,
      isVegan: false,
      minimumOrderAmount: 0,
      platformFee: 0,
      collectionFulfilmentMethod: 8,
      deliveryFulfilmentMethod: delv.id,
      deliveryPartner: deliveryPartner.id, // Agile
      products: [],
      vendorCategories: [1], // Cafes
      productCategories: [],
      fulfilmentPostalDistricts: [1, 2], // L1, L2
      users: [],
    }).fetch();

    const result = sails.helpers.calculateOrderTotal.with({
      pickupFromVendor: vendor.id,
      deliverAfter: moment.utc(`${deliveryStart}:00`, "HH:mm:ss"), //moment.utc("01:15:00 PM", "h:mm:ss A")
      deliverBefore: moment.utc(`${deliveryEnd}:00`, "HH:mm:ss"), //moment.utc("01:15:00 PM", "h:mm:ss A")

      deliveryContactName: "Test Delivery John Smith",
      deliveryPhoneNumber: "0746564653",
      deliveryComments: "Bants test comments for delivery instructions",

      deliveryAddressLineOne: "23 SomeLane",
      deliveryAddressLineTwo: "Liverpool",
      deliveryAddressCity: "Liverpool",
      deliveryAddressPostCode: "L1 0AR",
    });
    expect(result).to.be.nonEmpty();
  });
});
