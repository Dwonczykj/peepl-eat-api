// ./test/integration/models/User.test.js

import {expect, assert} from 'chai';
import 'mocha';
import moment from 'moment';
import { findIntersectingSlotFromSlots, intersectOverlappingSlotsInArray, intersectTimeWindowArrays, mergeOverlappingTimeWindowsInArray, TimeWindow } from '../../../../../api/interfaces/vendors/slot';

const util = require('util');


describe('units/api/interfaces/vendors/slot', () => {

  describe('Can intersect Slots', () => {
    it('can filter a list of slots to find the matching slot', () => {
      const slot = new TimeWindow({
        startTime: moment.utc("20220901 10:00:00", "YYYYMMDD HH:mm:ss"),
        endTime: moment.utc("20220901 11:00:00", "YYYYMMDD HH:mm:ss"),
      });

      
      const fulfilmentSlotFrom = moment.utc(
        "20220901 10:00:00",
        "YYYYMMDD HH:mm:ss"
      );
      const fulfilmentSlotTo = moment.utc(
        "20220901 11:00:00",
        "YYYYMMDD HH:mm:ss"
      );

      const match1 = fulfilmentSlotFrom.isSameOrAfter(slot.startTime);

      const match2 = fulfilmentSlotFrom.isSameOrBefore(slot.endTime);

      const match3 = fulfilmentSlotTo.isSameOrAfter(slot.startTime);

      const match4 = fulfilmentSlotTo.isSameOrBefore(slot.endTime);

      expect(match1).to.equal(true);
      expect(match2).to.equal(true);
      expect(match3).to.equal(true);
      expect(match4).to.equal(true);
      return;
    });
    it('can filter a list of slots to find the matching slot', () => {
      const slots = [
        new TimeWindow({
          startTime: moment.utc("20220901 09:00:00", "YYYYMMDD HH:mm:ss"),
          endTime: moment.utc("20220901 10:00:00", "YYYYMMDD HH:mm:ss"),
        }),
        new TimeWindow({
          startTime: moment.utc("20220901 10:00:00", "YYYYMMDD HH:mm:ss"),
          endTime: moment.utc("20220901 11:00:00", "YYYYMMDD HH:mm:ss"),
        }),
        new TimeWindow({
          startTime: moment.utc("20220901 11:00:00", "YYYYMMDD HH:mm:ss"),
          endTime: moment.utc("20220901 12:00:00", "YYYYMMDD HH:mm:ss"),
        }),
        new TimeWindow({
          startTime: moment.utc("20220901 12:00:00", "YYYYMMDD HH:mm:ss"),
          endTime: moment.utc("20220901 13:00:00", "YYYYMMDD HH:mm:ss"),
        }),
        new TimeWindow({
          startTime: moment.utc("20220901 13:00:00", "YYYYMMDD HH:mm:ss"),
          endTime: moment.utc("20220901 14:00:00", "YYYYMMDD HH:mm:ss"),
        }),
      ];

      const fulfilmentSlotFrom = moment.utc(
        "20220901 10:00:00",
        "YYYYMMDD HH:mm:ss"
      );
      const fulfilmentSlotTo = moment.utc(
        "20220901 11:00:00",
        "YYYYMMDD HH:mm:ss"
      );

      const matchingSlots = slots.filter((slot) => {
        return fulfilmentSlotFrom.isSameOrAfter(slot.startTime) &&
          fulfilmentSlotFrom.isSameOrBefore(slot.endTime) &&
          fulfilmentSlotTo.isSameOrAfter(slot.startTime) &&
          fulfilmentSlotTo.isSameOrBefore(slot.endTime);
      });

      // const fulfilmentSlotFrom = "20220901 10:00:00";
      // const fulfilmentSlotTo = "20220901 11:00:00";
      // const matchingSlots =
      //   slots.filter((slot) => {
      //     moment
      //       .utc(fulfilmentSlotFrom, "YYYYMMDD HH:mm:ss")
      //       .isSameOrAfter(slot.startTime) &&
      //       moment
      //         .utc(fulfilmentSlotFrom, "YYYYMMDD HH:mm:ss")
      //         .isSameOrBefore(slot.endTime) &&
      //       moment
      //         .utc(fulfilmentSlotTo, "YYYYMMDD HH:mm:ss")
      //         .isSameOrAfter(slot.startTime) &&
      //       moment
      //         .utc(fulfilmentSlotTo, "YYYYMMDD HH:mm:ss")
      //         .isSameOrBefore(slot.endTime);
      //   });

      expect(matchingSlots).to.have.lengthOf(1);
      return;
    });
    it('overLap 2 overlapping slots is true', (done) => {
      const s1 = moment.utc('20220901 13:00:00', 'YYYYMMDD HH:mm:ss');
      const e1 = moment.utc('20220901 15:00:00', 'YYYYMMDD HH:mm:ss');
      const s2 = moment.utc('20220901 14:00:00', 'YYYYMMDD HH:mm:ss');
      const e2 = moment.utc('20220901 16:00:00', 'YYYYMMDD HH:mm:ss');
      const slot1: TimeWindow = new TimeWindow({startTime: s1, endTime: e1});
      const slot2: TimeWindow = new TimeWindow({startTime: s2, endTime: e2});
      const isOverlap = slot1.overlapsWith(slot2);
      assert(isOverlap === true);
      return done();
    });
    it('intersection of a slot and a subslot is the subslot', (done) => {
      const s1 = moment.utc('20220901 13:00:00', 'YYYYMMDD HH:mm:ss');
      const e1 = moment.utc('20220901 18:00:00', 'YYYYMMDD HH:mm:ss');
      const s2 = moment.utc('20220901 14:00:00', 'YYYYMMDD HH:mm:ss');
      const e2 = moment.utc('20220901 16:00:00', 'YYYYMMDD HH:mm:ss');
      const slot1: TimeWindow = new TimeWindow({startTime: s1, endTime: e1});
      const slot2: TimeWindow = new TimeWindow({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert(!!interSlot, 'No slot was returned from Slot.intersectWith method: ' + util.inspect(interSlot, { depth: null }));
      
      expect(interSlot.startTime).to.eql(s2, `Intersected slot didnt have the correct start time, expected: ${interSlot.startTime}, actual: ${s2}`);
      expect(interSlot.endTime).to.eql(e2, `Intersected slot didnt have the correct end time, expected: ${interSlot.endTime}, actual: ${e2}`);
      
      return done();
    });
    it('intersection of adjacent slots is empty', (done) => {
      const s1 = moment.utc('20220901 10:00:00', 'YYYYMMDD HH:mm:ss');
      const e1 = moment.utc('20220901 11:00:00', 'YYYYMMDD HH:mm:ss');
      const s2 = moment.utc('20220901 11:00:00', 'YYYYMMDD HH:mm:ss');
      const e2 = moment.utc('20220901 12:00:00', 'YYYYMMDD HH:mm:ss');
      const slot1: TimeWindow = new TimeWindow({startTime: s1, endTime: e1});
      const slot2: TimeWindow = new TimeWindow({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert.isNull(
        interSlot,
        "No slot was returned from Slot.intersectWith method: " +
          util.inspect(interSlot, { depth: null })
      );
      return done();
    });
    it('intersection of 2 partially overlapping slots is a intersecting-slot', (done) => {
      const s1 = moment.utc('20220901 13:00:00', 'YYYYMMDD HH:mm:ss');
      const e1 = moment.utc('20220901 15:00:00', 'YYYYMMDD HH:mm:ss');
      const s2 = moment.utc('20220901 14:00:00', 'YYYYMMDD HH:mm:ss');
      const e2 = moment.utc('20220901 16:00:00', 'YYYYMMDD HH:mm:ss');
      const slot1: TimeWindow = new TimeWindow({startTime: s1, endTime: e1});
      const slot2: TimeWindow = new TimeWindow({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert(!!interSlot);
      assert(interSlot.startTime === s2);
      assert(interSlot.endTime === e1);
      return done();
    });
    it('intersection of 2 mutually exclusive slots is null', (done) => {
      const s1 = moment.utc('20220901 13:00:00', 'YYYYMMDD HH:mm:ss');
      const e1 = moment.utc('20220901 14:00:00', 'YYYYMMDD HH:mm:ss');
      const s2 = moment.utc('20220901 15:00:00', 'YYYYMMDD HH:mm:ss');
      const e2 = moment.utc('20220901 16:00:00', 'YYYYMMDD HH:mm:ss');
      const slot1: TimeWindow = new TimeWindow({startTime: s1, endTime: e1});
      const slot2: TimeWindow = new TimeWindow({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert(interSlot === null);
      return done();
    });
  });
  describe('Can intersect Arrays of Slots', () => {
    it("mergeOverlappingSlotsInArray() can merge overlapping slots within array", (done) => {
      // 9 -> 11
      const s1 = moment.utc("20220901 09:00:00", "YYYYMMDD HH:mm:ss");
      const e1 = moment.utc("20220901 11:00:00", "YYYYMMDD HH:mm:ss");
      // 10 -> 12
      const ds1 = moment.utc("20220901 10:00:00", "YYYYMMDD HH:mm:ss");
      const de1 = moment.utc("20220901 12:00:00", "YYYYMMDD HH:mm:ss");
      // 10:30 -> 11:30
      const ds3 = moment.utc("20220901 10:30:00", "YYYYMMDD HH:mm:ss");
      const de3 = moment.utc("20220901 11:30:00", "YYYYMMDD HH:mm:ss");

      // 15 -> 16
      const ds2 = moment.utc("20220901 15:00:00", "YYYYMMDD HH:mm:ss");
      const de2 = moment.utc("20220901 16:00:00", "YYYYMMDD HH:mm:ss");
      // 15:15 -> 15:45
      const s4 = moment.utc("20220901 15:15:00", "YYYYMMDD HH:mm:ss");
      const e4 = moment.utc("20220901 15:45:00", "YYYYMMDD HH:mm:ss");

      const slotv1: TimeWindow = new TimeWindow({ startTime: s1, endTime: e1 });
      const slotd1: TimeWindow = new TimeWindow({ startTime: ds1, endTime: de1 });
      const slotd3: TimeWindow = new TimeWindow({ startTime: ds3, endTime: de3 });

      const slotd2: TimeWindow = new TimeWindow({ startTime: ds2, endTime: de2 });
      const slotv4: TimeWindow = new TimeWindow({ startTime: s4, endTime: e4 });

      const mergedSlotArray = mergeOverlappingTimeWindowsInArray([
        slotv1,
        slotd1,
        slotd3,
        slotd2,
        slotv4,
      ]);

      assert.isNotEmpty(mergedSlotArray);
      assert(mergedSlotArray.length === 2);
      assert(mergedSlotArray[0].startTime === s1);
      assert(mergedSlotArray[0].endTime === de1);
      assert(mergedSlotArray[1].startTime === ds2);
      assert(mergedSlotArray[1].endTime === de2);

      return done();
    });
    it("intersectOverlappingSlotsInArray() can intersect overlapping slots within array i.e. [11->13, 12->14] would result in [12->13]", (done) => {
      // 9 -> 11
      const s1 = moment.utc("20220901 09:00:00", "YYYYMMDD HH:mm:ss");
      const e1 = moment.utc("20220901 11:00:00", "YYYYMMDD HH:mm:ss");
      // 10 -> 12
      const ds1 = moment.utc("20220901 10:00:00", "YYYYMMDD HH:mm:ss");
      const de1 = moment.utc("20220901 12:00:00", "YYYYMMDD HH:mm:ss");
      // 10:30 -> 11:30
      const ds3 = moment.utc("20220901 10:30:00", "YYYYMMDD HH:mm:ss");
      const de3 = moment.utc("20220901 11:30:00", "YYYYMMDD HH:mm:ss");

      // 15 -> 16
      const ds2 = moment.utc("20220901 15:00:00", "YYYYMMDD HH:mm:ss");
      const de2 = moment.utc("20220901 16:00:00", "YYYYMMDD HH:mm:ss");
      // 15:15 -> 15:45
      const s4 = moment.utc("20220901 15:15:00", "YYYYMMDD HH:mm:ss");
      const e4 = moment.utc("20220901 15:45:00", "YYYYMMDD HH:mm:ss");

      const slotv1: TimeWindow = new TimeWindow({ startTime: s1, endTime: e1 });
      const slotd1: TimeWindow = new TimeWindow({ startTime: ds1, endTime: de1 });
      const slotd3: TimeWindow = new TimeWindow({ startTime: ds3, endTime: de3 });

      const slotd2: TimeWindow = new TimeWindow({ startTime: ds2, endTime: de2 });
      const slotv4: TimeWindow = new TimeWindow({ startTime: s4, endTime: e4 });

      const mergedSlotArray = intersectOverlappingSlotsInArray([
        slotv1,
        slotd1,
        slotd3,
        slotd2,
        slotv4,
      ]);

      assert.isNotEmpty(mergedSlotArray);
      assert(mergedSlotArray.length === 2);
      assert(mergedSlotArray[0].startTime === ds3); // 10:30
      assert(mergedSlotArray[0].endTime === e1); // 11:00
      assert(mergedSlotArray[1].startTime === s4);
      assert(mergedSlotArray[1].endTime === e4);

      return done();
    });
    it("findIntersectingSlotFromSlots() can intersect overlapping slots within array i.e. [11->13, 12->14] would result in [12->13]", (done) => {
      // 9 -> 11
      const s1 = moment.utc("20220901 09:00:00", "YYYYMMDD HH:mm:ss");
      const e1 = moment.utc("20220901 11:00:00", "YYYYMMDD HH:mm:ss");
      // 10 -> 12
      const ds1 = moment.utc("20220901 10:00:00", "YYYYMMDD HH:mm:ss");
      const de1 = moment.utc("20220901 12:00:00", "YYYYMMDD HH:mm:ss");
      // 10:30 -> 11:30
      const ds3 = moment.utc("20220901 10:30:00", "YYYYMMDD HH:mm:ss");
      const de3 = moment.utc("20220901 11:30:00", "YYYYMMDD HH:mm:ss");

      // 15 -> 16
      const ds2 = moment.utc("20220901 15:00:00", "YYYYMMDD HH:mm:ss");
      const de2 = moment.utc("20220901 16:00:00", "YYYYMMDD HH:mm:ss");
      // 15:15 -> 15:45
      const s4 = moment.utc("20220901 15:15:00", "YYYYMMDD HH:mm:ss");
      const e4 = moment.utc("20220901 15:45:00", "YYYYMMDD HH:mm:ss");

      const slotv1: TimeWindow = new TimeWindow({ startTime: s1, endTime: e1 });
      const slotd1: TimeWindow = new TimeWindow({ startTime: ds1, endTime: de1 });
      const slotd3: TimeWindow = new TimeWindow({ startTime: ds3, endTime: de3 });

      const slotd2: TimeWindow = new TimeWindow({ startTime: ds2, endTime: de2 });
      const slotv4: TimeWindow = new TimeWindow({ startTime: s4, endTime: e4 });

      const mergedSlot = findIntersectingSlotFromSlots([
        slotv1,
        slotd1,
        slotd3,
      ]);
      
      assert.isNotNull(mergedSlot);
      assert(mergedSlot.startTime === ds3);
      assert(mergedSlot.endTime === e1);

      const mergedSlotNull = findIntersectingSlotFromSlots([
        slotv1,
        slotd2,
      ]);
      assert.isNull(mergedSlotNull);
      
      const mergedSlotNull2 = findIntersectingSlotFromSlots([
        slotv1,
        slotd1,
        slotd3,
        slotd2,
        slotv4,
      ]);
      assert.isNull(mergedSlotNull2);

      return done();
    });
    it('overLap 2 overlapping slots is true', (done) => {
      // 9 -> 11
      const s1 = moment.utc('20220901 09:00:00', 'YYYYMMDD HH:mm:ss');
      const e1 = moment.utc('20220901 11:00:00', 'YYYYMMDD HH:mm:ss');
      // 12 -> 14
      const s2 = moment.utc('20220901 12:00:00', 'YYYYMMDD HH:mm:ss');
      const e2 = moment.utc('20220901 14:00:00', 'YYYYMMDD HH:mm:ss');
      // 15:15 -> 15:45
      const s4 = moment.utc('20220901 15:15:00', 'YYYYMMDD HH:mm:ss');
      const e4 = moment.utc('20220901 15:45:00', 'YYYYMMDD HH:mm:ss');
      
      // 10 -> 12
      const ds1 = moment.utc('20220901 10:00:00', 'YYYYMMDD HH:mm:ss');
      const de1 = moment.utc('20220901 12:00:00', 'YYYYMMDD HH:mm:ss');
      // 10:30 -> 11:30
      const ds3 = moment.utc('20220901 10:30:00', 'YYYYMMDD HH:mm:ss');
      const de3 = moment.utc('20220901 11:30:00', 'YYYYMMDD HH:mm:ss');
      // 15 -> 16
      const ds2 = moment.utc('20220901 15:00:00', 'YYYYMMDD HH:mm:ss');
      const de2 = moment.utc('20220901 16:00:00', 'YYYYMMDD HH:mm:ss');

      const slotv1: TimeWindow = new TimeWindow({startTime: s1, endTime: e1});
      const slotv2: TimeWindow = new TimeWindow({startTime: s2, endTime: e2});
    //   const slotv3: Slot = new Slot({startTime: s2.add(120, 'minutes'), endTime: e2.add(120, 'minutes')});
      const slotv4: TimeWindow = new TimeWindow({startTime: s4, endTime: e4});

      const slotd1: TimeWindow = new TimeWindow({startTime: ds1, endTime: de1});
      const slotd2: TimeWindow = new TimeWindow({startTime: ds2, endTime: de2});
      const slotd3: TimeWindow = new TimeWindow({startTime: ds3, endTime: de3});

      const arrayIntersection = intersectTimeWindowArrays([slotv1, slotv2, slotv4], [slotd1, slotd2, slotd3]);

      assert(!!arrayIntersection);
      assert(arrayIntersection.length === 2);
      assert(arrayIntersection[0].startTime === ds1);
      assert(arrayIntersection[0].endTime === e1);
      assert(arrayIntersection[1].startTime === s4);
      assert(arrayIntersection[1].endTime === e4);

      return done();
    });
    
  });

});
