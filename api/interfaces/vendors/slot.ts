import _ from 'lodash';
import moment from 'moment';


export interface iSlot {
  startTime: (string | moment.Moment);
  endTime: (string | moment.Moment);
}

export class Slot implements iSlot {
  startTime: moment.Moment;
  endTime: moment.Moment;
  constructor(args: {
      startTime: (string | moment.Moment),
      endTime: (string | moment.Moment),
    }) {
    this.startTime = moment.utc(args.startTime);
    this.endTime = moment.utc(args.endTime);
  }
  static from(iSlot: iSlot){
    return new Slot({
      startTime: iSlot.startTime,
      endTime: iSlot.endTime
    });
  }
  public startsBefore (other: iSlot) {
    return moment.utc(this.startTime).isSameOrBefore(moment.utc(other.startTime));
  }
  public startsAfter (other: iSlot) {
    return moment.utc(this.startTime).isAfter(moment.utc(other.endTime));
  }
  public endsAfter (other: iSlot) {
    return moment.utc(this.endTime).isSameOrAfter(moment.utc(other.endTime));
  }
  public endsBefore (other: iSlot) {
    return moment.utc(this.endTime).isBefore(moment.utc(other.startTime));
  }
  public overlapsWith =
    (otherSlot:Slot) => {
      return this.intersectWith(otherSlot) !== null;
    }
  public intersectWith =
    (otherSlot:Slot) => {
      const slot1 = this;
      if (slot1.startsBefore(otherSlot) && slot1.endsAfter(otherSlot)){
        return otherSlot;
      } else if (slot1.startsBefore(otherSlot)){
        if (slot1.endsBefore(otherSlot)){
          return null;
        }
        return new Slot({
          startTime: otherSlot.startTime,
          endTime: slot1.endTime
        });
      } else if (slot1.endsAfter(otherSlot)){
        if (slot1.startsAfter(otherSlot)){
          return null;
        }
        return new Slot({
          startTime: slot1.startTime,
          endTime: otherSlot.endTime
        });
      } else {
        return slot1;
      }
    }

}

export const mergeOverlappingSlotsInArray = (slotArr:Slot[]) => { 
  const result: Slot[] = [];
  for (let i = 0; i < slotArr.length; i++) {
    let slotIStart = slotArr[i].startTime;
    let slotIEnd = slotArr[i].endTime;
    for (let j = i; j < slotArr.length; j++) {
      if(slotArr[i].overlapsWith(slotArr[j])){
        slotIStart = moment.min(slotIStart, slotArr[j].startTime);
        slotIEnd = moment.max(slotIEnd, slotArr[j].endTime);
      }
    }
    result.push(new Slot({startTime: slotIStart, endTime: slotIEnd}));
  }
  return result;
};

export const intersectSlotArrays = (slotArr1:Slot[],slotArr2:Slot[]) => {
  const result: Slot[] = [];
  let slots1 = mergeOverlappingSlotsInArray(slotArr1);
  let slots2 = mergeOverlappingSlotsInArray(slotArr2);
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

export const mergeICollectionDates: (c1:iCollectionDates, c2:iCollectionDates) => iCollectionDates
  = (c1:iCollectionDates, c2:iCollectionDates) => {
    return {
      availableDaysOfWeek: _.intersection(c1.availableDaysOfWeek, c2.availableDaysOfWeek),
      availableSpecialDates: _.intersection(c1.availableSpecialDates, c2.availableSpecialDates)
    };
  };
