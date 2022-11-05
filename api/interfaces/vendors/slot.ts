import { AvailableDateOpeningHours } from '../../../api/helpers/get-available-dates';
import _ from 'lodash';
import moment from 'moment';
import { dateStrFormat, FulfilmentMethodType, momentUtcString, timeStrFormat } from '../../../scripts/utils';
import { FulfilmentMethodPriorityHandler } from '../../../config/fulfilmentPriority';
import { DaysOfWeek } from '../../../scripts/DaysOfWeek';

// eslint-disable-next-line no-unused-vars
function arraysEqual<T>(a:Array<T>, b:Array<T>) {
  if (a === b) {return true;}
  if (a === null || b === null) {return false;}
  if (a.length !== b.length) {return false;}

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {return false;}
  }
  return true;
}


export type iSlot = {
  startTime: moment.Moment;
  endTime: moment.Moment;
}

export type iFulfilmentSlot = iSlot & {
  fulfilmentMethod: FulfilmentMethodType;
}

export type iFulfilmentSlotHttpResponse = {
  startTime: momentUtcString;
  endTime: momentUtcString;
  fulfilmentMethod: FulfilmentMethodType;
};

export interface iSlotMethods {
  intersectWith: (unusedOtherSlot: this) => this;
  mergeWith: (unusedOtherSlot: this) => this;
  overlapsWith: (unusedOtherSlot: this) => boolean;
}

export interface iSlotClass extends iSlotMethods, iSlot {}

export interface iFulfilmentSlotClass extends iSlotClass, iFulfilmentSlot {}

interface ConstructorOf<T extends iSlotClass> {
  // ~ https://stackoverflow.com/questions/38877252/typescript-getting-a-class-constructor-of-the-object-at-runtime
  new (
    unusedArgs: T extends iFulfilmentSlotClass
      ?
          | {
              startTime: moment.Moment;
              endTime: moment.Moment;
              date?: moment.Moment;
              fulfilmentMethod: FulfilmentMethodType;
            }
          | {
              startTime: string;
              endTime: string;
              date: moment.Moment;
              fulfilmentMethod: FulfilmentMethodType;
            }
      :
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
  ): T;
}


export class TimeWindow implements iSlotClass {
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
  public overlapsWith = (otherSlot: this) => {
    return this.intersectWithTimeWindow(otherSlot) !== null;
  };
  public contains = (otherSlot: this) => {
    const slot1 = this;
    if (slot1.startsBefore(otherSlot) && slot1.endsAfter(otherSlot)) {
      return true;
    } else {
      return false;
    }
  };

  get cls(): ConstructorOf<iSlotClass> {
    return this.constructor as ConstructorOf<iSlotClass>;
  }

  clone() {
    const ret = new this.cls({
      startTime: this.startTime,
      endTime: this.endTime,
    });
    return ret;
  }

  public intersectWithTimeWindow = (otherSlot: this) => {
    const slot1 = this;
    if (slot1.startsBefore(otherSlot) && slot1.endsAfter(otherSlot)) {
      return otherSlot;
    } else if (slot1.startsBefore(otherSlot)) {
      if (slot1.endsBefore(otherSlot) || slot1.endsAsOtherStarts(otherSlot)) {
        return null;
      }
      return new this.cls({
        startTime: otherSlot.startTime,
        endTime: slot1.endTime,
      });
    } else if (slot1.endsAfter(otherSlot)) {
      if (slot1.startsAfter(otherSlot) || slot1.startsAsOtherEnds) {
        return null;
      }
      return new this.cls({
        startTime: slot1.startTime,
        endTime: otherSlot.endTime,
      });
    } else {
      return slot1;
    }
  };
  public mergeWithTimeWindow = (otherSlot: this) => {
    return new this.cls({
      startTime: moment.min(this.startTime, otherSlot.startTime),
      endTime: moment.max(this.endTime, otherSlot.endTime),
    });
  };

  public intersectWith = (otherSlot: this) =>
    this.intersectWithTimeWindow(otherSlot) as this;

  public mergeWith = (otherSlot: this) =>
    this.mergeWithTimeWindow(otherSlot) as this;
}

export class FulfilmentTimeWindow extends TimeWindow implements iFulfilmentSlotClass {
  fulfilmentMethod: FulfilmentMethodType;
  constructor(
    args:
      | {
          startTime: moment.Moment;
          endTime: moment.Moment;
          date?: moment.Moment;
          fulfilmentMethod: FulfilmentMethodType;
        }
      | {
          startTime: string;
          endTime: string;
          date: moment.Moment;
          fulfilmentMethod: FulfilmentMethodType;
        }
  ) {
    super(args);
    this.fulfilmentMethod = args.fulfilmentMethod;
  }
  static from(iSlot: iFulfilmentSlot) {
    return new FulfilmentTimeWindow({
      startTime: iSlot.startTime,
      endTime: iSlot.endTime,
      fulfilmentMethod: iSlot.fulfilmentMethod
    });
  }

  get cls(): ConstructorOf<iFulfilmentSlotClass> {
    return this.constructor as ConstructorOf<iFulfilmentSlotClass>;
  }

  clone() {
    const ret = new this.cls({
      startTime: this.startTime,
      endTime: this.endTime,
      fulfilmentMethod: this.fulfilmentMethod,
    });
    return ret;
  }

  public intersectWith = (otherSlot: this) =>
    this.intersectWithFulfilment(otherSlot) as this;

  public intersectWithFulfilment = (otherSlot: this) => {
    const tw = this.intersectWithTimeWindow(otherSlot);
    if (
      !tw ||
      this.fulfilmentMethod.methodType !== otherSlot.fulfilmentMethod.methodType
    ) {
      return null;
    }
    return new this.cls({
      startTime: tw.startTime,
      endTime: tw.endTime,
      fulfilmentMethod: FulfilmentMethodPriorityHandler.pickFulfilmentMethod([
        this.fulfilmentMethod,
        otherSlot.fulfilmentMethod,
      ]),
    });
  };
  public mergeWith = (otherSlot: this) =>
    this.mergeWithFulfilment(otherSlot) as this;

  public mergeWithFulfilment = (otherSlot: this) => {
    const tw = this.mergeWithTimeWindow(otherSlot);
    if (
      this.fulfilmentMethod.methodType !== otherSlot.fulfilmentMethod.methodType
    ) {
      throw new Error(
        'Can only merge FulfilmentTimeWindows of same methodType'
      );
    }
    return new FulfilmentTimeWindow({
      startTime: tw.startTime,
      endTime: tw.endTime,
      fulfilmentMethod: FulfilmentMethodPriorityHandler.pickFulfilmentMethod([
        this.fulfilmentMethod,
        otherSlot.fulfilmentMethod,
      ]),
    });
  };
}

export const mergeOverlappingTimeWindowsInArray = <T extends iSlotClass>(slotArr:T[]) => { 
  const result: T[] = [];
  for (let i = 0; i < slotArr.length; i++) {
    let merged:T;
    for (let j = i; j < slotArr.length; j++) {
      if(slotArr[i].overlapsWith(slotArr[j])){
        merged = slotArr[i].mergeWith(slotArr[j]);
      }
    }
    if(merged){
      result.push(merged);
    }
  }
  return result;
};

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

export const intersectTimeWindowArrays = <T extends iSlotClass>(
  slotArr1: T[],
  slotArr2: T[]
) => {
  const result: T[] = [];
  let slots1 = mergeOverlappingTimeWindowsInArray(slotArr1);
  let slots2 = mergeOverlappingTimeWindowsInArray(slotArr2);
  for (const slot1 of slots1) {
    for (const slot2 of slots2) {
      const intersectionSlot = slot1.intersectWith(slot2);
      if (intersectionSlot) {
        result.push(intersectionSlot);
      }
    }
  }
  return result;
};

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
