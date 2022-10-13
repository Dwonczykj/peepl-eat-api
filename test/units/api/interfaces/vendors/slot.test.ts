// ./test/integration/models/User.test.js

import * as chai from 'chai';
import { assert } from 'console';
import 'mocha';
import moment from 'moment';
import { intersectSlotArrays, mergeOverlappingSlotsInArray, Slot } from '../../../../../api/interfaces/vendors/slot';

const util = require('util');
const expect = chai.expect;

describe('units/api/interfaces/vendors/slot', () => {

  describe('Can intersect Slots', () => {
    it('overLap 2 overlapping slots is true', (done) => {
      const s1 = moment('20220901 13:00:00', 'YYYYMMdd hh:mm:ss');
      const e1 = moment('20220901 15:00:00', 'YYYYMMdd hh:mm:ss');
      const s2 = moment('20220901 14:00:00', 'YYYYMMdd hh:mm:ss');
      const e2 = moment('20220901 16:00:00', 'YYYYMMdd hh:mm:ss');
      const slot1: Slot = new Slot({startTime: s1, endTime: e1});
      const slot2: Slot = new Slot({startTime: s2, endTime: e2});
      const isOverlap = slot1.overlapsWith(slot2);
      assert(isOverlap === true);
      return done();
    });
    it('intersection of a slot and a subslot is the subslot', (done) => {
      const s1 = moment('20220901 13:00:00', 'YYYYMMdd hh:mm:ss');
      const e1 = moment('20220901 18:00:00', 'YYYYMMdd hh:mm:ss');
      const s2 = moment('20220901 14:00:00', 'YYYYMMdd hh:mm:ss');
      const e2 = moment('20220901 16:00:00', 'YYYYMMdd hh:mm:ss');
      const slot1: Slot = new Slot({startTime: s1, endTime: e1});
      const slot2: Slot = new Slot({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert(!!interSlot, 'No slot was returned from Slot.intersectWith method: ' + util.inspect(interSlot, { depth: null }));
      
      expect(interSlot.startTime).to.eql(s2, `Intersected slot didnt have the correct start time, expected: ${interSlot.startTime}, actual: ${s2}`);
      expect(interSlot.endTime).to.eql(e2, `Intersected slot didnt have the correct end time, expected: ${interSlot.endTime}, actual: ${e2}`);
      
      return done();
    });
    it('intersection of 2 partially overlapping slots is a intersecting-slot', (done) => {
      const s1 = moment('20220901 13:00:00', 'YYYYMMdd hh:mm:ss');
      const e1 = moment('20220901 15:00:00', 'YYYYMMdd hh:mm:ss');
      const s2 = moment('20220901 14:00:00', 'YYYYMMdd hh:mm:ss');
      const e2 = moment('20220901 16:00:00', 'YYYYMMdd hh:mm:ss');
      const slot1: Slot = new Slot({startTime: s1, endTime: e1});
      const slot2: Slot = new Slot({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert(!!interSlot);
      assert(interSlot.startTime === s2);
      assert(interSlot.endTime === e1);
      return done();
    });
    it('intersection of 2 mutually exclusive slots is null', (done) => {
      const s1 = moment('20220901 13:00:00', 'YYYYMMdd hh:mm:ss');
      const e1 = moment('20220901 14:00:00', 'YYYYMMdd hh:mm:ss');
      const s2 = moment('20220901 15:00:00', 'YYYYMMdd hh:mm:ss');
      const e2 = moment('20220901 16:00:00', 'YYYYMMdd hh:mm:ss');
      const slot1: Slot = new Slot({startTime: s1, endTime: e1});
      const slot2: Slot = new Slot({startTime: s2, endTime: e2});
      const interSlot = slot1.intersectWith(slot2);
      assert(interSlot === null);
      return done();
    });
  });
  describe('Can intersect Arrays of Slots', () => {
    it('can merge overlapping slots within array', (done) => {
      // 9 -> 11
      const s1 = moment('20220901 09:00:00', 'YYYYMMdd hh:mm:ss');
      const e1 = moment('20220901 11:00:00', 'YYYYMMdd hh:mm:ss');
      // 10 -> 12
      const ds1 = moment('20220901 10:00:00', 'YYYYMMdd hh:mm:ss');
      const de1 = moment('20220901 12:00:00', 'YYYYMMdd hh:mm:ss');
      // 10:30 -> 11:30
      const ds3 = moment('20220901 10:30:00', 'YYYYMMdd hh:mm:ss');
      const de3 = moment('20220901 11:30:00', 'YYYYMMdd hh:mm:ss');

      // 15 -> 16
      const ds2 = moment('20220901 15:00:00', 'YYYYMMdd hh:mm:ss');
      const de2 = moment('20220901 16:00:00', 'YYYYMMdd hh:mm:ss');
      // 15:15 -> 15:45
      const s4 = moment('20220901 15:15:00', 'YYYYMMdd hh:mm:ss');
      const e4 = moment('20220901 15:45:00', 'YYYYMMdd hh:mm:ss');

      const slotv1: Slot = new Slot({startTime: s1, endTime: e1});
      const slotd1: Slot = new Slot({startTime: ds1, endTime: de1});
      const slotd3: Slot = new Slot({startTime: ds3, endTime: de3});

      const slotd2: Slot = new Slot({startTime: ds2, endTime: de2});
      const slotv4: Slot = new Slot({startTime: s4, endTime: e4});

      const mergedSlotArray = mergeOverlappingSlotsInArray([slotv1, slotd1, slotd3, slotd2, slotv4]);

      assert(!!mergedSlotArray);
      assert(mergedSlotArray.length === 2);
      assert(mergedSlotArray[0].startTime === s1);
      assert(mergedSlotArray[0].endTime === de1);
      assert(mergedSlotArray[1].startTime === ds2);
      assert(mergedSlotArray[1].endTime === de2);

      return done();
    });
    it('overLap 2 overlapping slots is true', (done) => {
      // 9 -> 11
      const s1 = moment('20220901 09:00:00', 'YYYYMMdd hh:mm:ss');
      const e1 = moment('20220901 11:00:00', 'YYYYMMdd hh:mm:ss');
      // 12 -> 14
      const s2 = moment('20220901 12:00:00', 'YYYYMMdd hh:mm:ss');
      const e2 = moment('20220901 14:00:00', 'YYYYMMdd hh:mm:ss');
      // 15:15 -> 15:45
      const s4 = moment('20220901 15:15:00', 'YYYYMMdd hh:mm:ss');
      const e4 = moment('20220901 15:45:00', 'YYYYMMdd hh:mm:ss');
      
      // 10 -> 12
      const ds1 = moment('20220901 10:00:00', 'YYYYMMdd hh:mm:ss');
      const de1 = moment('20220901 12:00:00', 'YYYYMMdd hh:mm:ss');
      // 10:30 -> 11:30
      const ds3 = moment('20220901 10:30:00', 'YYYYMMdd hh:mm:ss');
      const de3 = moment('20220901 11:30:00', 'YYYYMMdd hh:mm:ss');
      // 15 -> 16
      const ds2 = moment('20220901 15:00:00', 'YYYYMMdd hh:mm:ss');
      const de2 = moment('20220901 16:00:00', 'YYYYMMdd hh:mm:ss');

      const slotv1: Slot = new Slot({startTime: s1, endTime: e1});
      const slotv2: Slot = new Slot({startTime: s2, endTime: e2});
    //   const slotv3: Slot = new Slot({startTime: s2.add(120, 'minutes'), endTime: e2.add(120, 'minutes')});
      const slotv4: Slot = new Slot({startTime: s4, endTime: e4});

      const slotd1: Slot = new Slot({startTime: ds1, endTime: de1});
      const slotd2: Slot = new Slot({startTime: ds2, endTime: de2});
      const slotd3: Slot = new Slot({startTime: ds3, endTime: de3});

      const arrayIntersection = intersectSlotArrays([slotv1, slotv2, slotv4], [slotd1, slotd2, slotd3]);

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
