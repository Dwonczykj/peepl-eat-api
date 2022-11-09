import { timeStrFormat, datetimeStrFormat, momentUtcString, dateStrFormat, datetimeStrFormatExact, datetimeStrTzFormat, timeStrTzFormat, datetimeMomentUtcStrTzFormat, DateString, TimeHourString, DateTimeHourString, DateTimeString } from "./utils";
import { iSlot } from "../api/interfaces/vendors/slot";
import moment from "moment";

type genDateStrFormat =
  | typeof dateStrFormat
  | typeof timeStrFormat
  | typeof datetimeStrFormat
  | typeof datetimeStrFormatExact
  | typeof datetimeStrTzFormat
  | typeof datetimeMomentUtcStrTzFormat
  | typeof timeStrTzFormat;
type dateStringMap<T extends genDateStrFormat> = T extends typeof dateStrFormat
  ? DateString
  : T extends typeof timeStrFormat
  ? TimeHourString
  : T extends typeof timeStrTzFormat
  ? `${TimeHourString} Z`
  : T extends typeof datetimeStrFormat
  ? DateTimeHourString
  : T extends typeof datetimeStrFormatExact
  ? DateTimeString
  : T extends typeof datetimeMomentUtcStrTzFormat
  ? momentUtcString
  : T extends typeof datetimeStrTzFormat
  ? `${DateTimeHourString} Z`
  : never;

const stringifySlotT = <T extends iSlot, S extends genDateStrFormat>(
  slot: T,
  format: genDateStrFormat
): T & { startTime: dateStringMap<S>; endTime: dateStringMap<S> } => ({
    ...slot,
    ...{
      startTime: slot.startTime.format(format) as dateStringMap<S>,
      endTime: slot.endTime.format(format) as dateStringMap<S>,
    },
  });

export const stringifySlot = <T extends iSlot, S extends string>(
  slot: T,
  format:
    | typeof dateStrFormat
    | typeof timeStrFormat
    | typeof datetimeStrFormat
    | typeof datetimeStrFormatExact
    | typeof datetimeStrTzFormat
    | typeof timeStrTzFormat
): T & { startTime: S; endTime: S } => ({
    ...slot,
    ...{
      startTime: slot.startTime.format(format) as S,
      endTime: slot.endTime.format(format) as S,
    },
  });

export const stringifySlotWithTimes = (slot: iSlot) => ({
  startTime: slot.startTime.format(timeStrFormat),
  endTime: slot.endTime.format(timeStrFormat),
});
export const stringifySlotWithDate = (slot: iSlot) => ({
  startTime: slot.startTime.format(datetimeStrFormat),
  endTime: slot.endTime.format(datetimeStrFormat),
});
export const stringifySlotUsingMomentUTCDefault = <T extends iSlot>(
  slot: T
): T & { startTime: momentUtcString; endTime: momentUtcString } => slot && ({
    ...slot,
    ...{
      startTime: slot.startTime.toISOString() as momentUtcString,
      endTime: slot.endTime.toISOString() as momentUtcString, // "2022-11-10T15:00:00.000Z"
    },
  });
export const stringifySlots = (availableSlots: iSlot[]) => availableSlots.map((slot) => ({
  startTime: slot.startTime.format(timeStrFormat),
  endTime: slot.endTime.format(timeStrFormat),
}));
export const stringifySlotsHttpResponse = (
  availableSlots: { startTime: string; endTime: string; }[]
) => availableSlots.map((slot) => ({
  startTime: moment.utc(slot.startTime).format(`${timeStrFormat}`),
  endTime: moment.utc(slot.endTime).format(`${timeStrFormat}`),
}));
export const stringifySlotsWithDateHttpResponse = (availableSlots: { startTime: string; endTime: string; }[]) => availableSlots.map((slot) => ({
  startTime: moment.utc(slot.startTime).format(`${datetimeStrFormat}`),
  endTime: moment.utc(slot.endTime).format(`${datetimeStrFormat}`),
}));
export const stringifySlotWithDateHttpResponse = (slot: { startTime: string; endTime: string; }) => ({
  startTime: moment.utc(slot.startTime).format(`${datetimeStrFormat}`),
  endTime: moment.utc(slot.endTime).format(`${datetimeStrFormat}`),
});
