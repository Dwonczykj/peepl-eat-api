import { AvailableDateOpeningHours } from 'api/helpers/get-available-dates';
import _ from 'lodash';
import moment from 'moment';
import { dateStrFormat, timeStrFormat } from '../../../scripts/utils';


export interface iSlot {
  startTime: (moment.Moment);
  endTime: (moment.Moment);
}

export class TimeWindow implements iSlot {
  startTime: moment.Moment;
  endTime: moment.Moment;
  constructor(
    args:
      | {
          startTime: moment.Moment;
          endTime: moment.Moment;
          date?: moment.Moment;
        }
      | {
          startTime: string;
          endTime: string;
          date: moment.Moment;
        }
  ) {
    this.startTime = moment.isMoment(args.startTime)
      ? moment.utc(args.startTime)
      : moment.utc(
          `${args.date.format(dateStrFormat)} ${args.startTime}`,
          `${dateStrFormat} ${timeStrFormat}`
      );
    this.endTime = moment.isMoment(args.endTime)
      ? moment.utc(args.endTime)
      : moment.utc(
          `${args.date.format(dateStrFormat)} ${args.endTime}`,
          `${dateStrFormat} ${timeStrFormat}`
      );
  }
  
  static from(iSlot: iSlot) {
    return new TimeWindow({
      startTime: iSlot.startTime,
      endTime: iSlot.endTime,
    });
  }
  public startsBefore(other: iSlot) {
    return moment
      .utc(this.startTime)
      .isSameOrBefore(moment.utc(other.startTime));
  }
  public startsAfter(other: iSlot) {
    return moment.utc(this.startTime).isAfter(moment.utc(other.endTime));
  }
  public endsAfter(other: iSlot) {
    return moment.utc(this.endTime).isAfter(moment.utc(other.endTime));
  }
  public endsAsOtherStarts(other: iSlot) {
    return moment.utc(this.endTime).isSame(moment.utc(other.startTime));
  }
  public startsAsOtherEnds(other: iSlot) {
    return moment.utc(this.startTime).isSame(moment.utc(other.endTime));
  }
  public endsBefore(other: iSlot) {
    return moment.utc(this.endTime).isBefore(moment.utc(other.startTime));
  }
  public overlapsWith = (otherSlot: TimeWindow) => {
    return this.intersectWith(otherSlot) !== null;
  };
  public contains = (otherSlot: TimeWindow) => {
    const slot1 = this;
    if (slot1.startsBefore(otherSlot) && slot1.endsAfter(otherSlot)) {
      return true;
    } else {
      return false;
    }
  };
  public intersectWith = (otherSlot: TimeWindow) => {
    const slot1 = this;
    if (slot1.startsBefore(otherSlot) && slot1.endsAfter(otherSlot)) {
      return otherSlot;
    } else if (slot1.startsBefore(otherSlot)) {
      if (slot1.endsBefore(otherSlot) || slot1.endsAsOtherStarts(otherSlot)) {
        return null;
      }
      return new TimeWindow({
        startTime: otherSlot.startTime,
        endTime: slot1.endTime,
      });
    } else if (slot1.endsAfter(otherSlot)) {
      if (slot1.startsAfter(otherSlot) || slot1.startsAsOtherEnds) {
        return null;
      }
      return new TimeWindow({
        startTime: slot1.startTime,
        endTime: otherSlot.endTime,
      });
    } else {
      return slot1;
    }
  };
}

export const mergeOverlappingTimeWindowsInArray = (slotArr:TimeWindow[]) => { 
  const result: TimeWindow[] = [];
  for (let i = 0; i < slotArr.length; i++) {
    let slotIStart = slotArr[i].startTime;
    let slotIEnd = slotArr[i].endTime;
    for (let j = i; j < slotArr.length; j++) {
      if(slotArr[i].overlapsWith(slotArr[j])){
        slotIStart = moment.min(slotIStart, slotArr[j].startTime);
        slotIEnd = moment.max(slotIEnd, slotArr[j].endTime);
      }
    }
    result.push(new TimeWindow({startTime: slotIStart, endTime: slotIEnd}));
  }
  return result;
};

//TODO: Test this function
export const intersectOverlappingSlotsInArray = (slotArr:TimeWindow[]) => { 
  const result: TimeWindow[] = [];
  for (let i = 0; i < slotArr.length; i++) {
    let slotIStart = slotArr[i].startTime;
    let slotIEnd = slotArr[i].endTime;
    for (let j = i; j < slotArr.length; j++) {
      if(slotArr[i].overlapsWith(slotArr[j])){
        slotIStart = moment.max(slotIStart, slotArr[j].startTime);
        slotIEnd = moment.min(slotIEnd, slotArr[j].endTime);
      }
    }
    result.push(new TimeWindow({startTime: slotIStart, endTime: slotIEnd}));
  }
  return result;
};

//TODO: Test this function
export const findIntersectingSlotFromSlots = (slots:TimeWindow[]) => {
  if(!slots || slots.length <= 0){
    return null;
  }
  let instersectionOfAllSlots = slots[0];
  for (let i = 1; i < slots.length; i += 1) {
    instersectionOfAllSlots = instersectionOfAllSlots.intersectWith(slots[i]);
    if(!instersectionOfAllSlots){
      return null;
    }
  }
  return instersectionOfAllSlots;
};

export const intersectTimeWindowArrays = (slotArr1:TimeWindow[],slotArr2:TimeWindow[]) => {
  const result: TimeWindow[] = [];
  let slots1 = mergeOverlappingTimeWindowsInArray(slotArr1);
  let slots2 = mergeOverlappingTimeWindowsInArray(slotArr2);
  for (const slot1 of slots1) {
    for (const slot2 of slots2) {
      const intersectionSlot = slot1.intersectWith(slot2);
      if (intersectionSlot){
        result.push(intersectionSlot);
      }
    }
  }
  return result;
};

export type DaysOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface iCollectionDates {
  availableDaysOfWeek: DaysOfWeek[];
  availableSpecialDates: moment.Moment[];
}

export const mergeICollectionDates: (unusedC1:iCollectionDates, unusedC2:iCollectionDates) => iCollectionDates
  = (c1:iCollectionDates, c2:iCollectionDates) => {
    return {
      availableDaysOfWeek: _.intersection(c1.availableDaysOfWeek, c2.availableDaysOfWeek),
      availableSpecialDates: _.intersection(c1.availableSpecialDates, c2.availableSpecialDates)
    };
  };
export const mergeAvailableDates = (
  c1: AvailableDateOpeningHours,
  c2: AvailableDateOpeningHours
) => {
  const intersectingDates = _.intersection(
    Object.keys(c1),
    Object.keys(c2),
  );
  return intersectingDates.map(dt => ({
    dateStr: dt,
    openingHours: [
      ...c1[dt],
      ...c2[dt],
    ]
  })).reduce((prev, cur) => ({...prev, [cur.dateStr]: cur.openingHours}), {} as AvailableDateOpeningHours);
};
