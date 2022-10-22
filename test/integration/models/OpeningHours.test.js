const { assert, expect } = require("chai");
var util = require("util");

describe("OpeningHours (model)", () => {
  describe("Can Create model of type OpeningHours", () => {
    let newOh;
    let fm;
    it("should create opening hours and set logicId field", async () => {
      const fms = await FulfilmentMethod.find({
        deliveryPartner: 1, //Agile
        methodType: "delivery",
        name: "Agile delivery Fulfilment Slot",
      });
      assert.isNotEmpty(fms);
      fm = fms[0];
      newOh = await OpeningHours.create({
        dayOfWeek: "monday",
        isOpen: true,
        openTime: "04:00",
        closeTime: "06:15",
        timezone: 0, // GMT
        fulfilmentMethod: fm.id,
      }).fetch();
      expect(newOh).to.have.property('id');
    });
    it("should create opening hours and set logicId field", async () => {
      expect(newOh).to.have.property('logicId');
      expect(newOh.logicId).to.equal("1_w_mon_04:00 +00:00_06:15 +00:00");
    });
    it("should add itself to the FulfilmentMethod's openingHours collection", async () => {
      const oh = await OpeningHours.findOne(newOh.id).populate(
        "fulfilmentMethod&fulfilmentMethod.openingHours"
      );
      expect(newOh).to.have.property("fulfilmentMethod");
      // expect(newOh.fulfilmentMethod).to.have.property("openingHours");
      // expect(oh.fulfilmentMethod.openingHours).to.include(oh.id);
      const _fmOh = await FulfilmentMethod.findOne(oh.fulfilmentMethod.id).populate('openingHours');
      expect(_fmOh.openingHours.map(o => (o.id))).to.include(oh.id);
    });
  });
});
