export {}; //SOLVED TypeScript Cannot Redeclare Block Scoped Variable Name https://backbencher.dev/articles/typescript-solved-cannot-redeclare-block-scoped-variable-name
declare let FulfilmentMethod: any;
import {
  FulfilmentTimeWindow,
  iFulfilmentSlot,
  intersectTimeWindowArrays,
  iSlot,
  TimeWindow as TimeWindow,
} from "../interfaces/vendors/slot";

import moment from "moment";
import {
  dateStrFormat,
  FulfilmentMethodType,
} from "../../scripts/utils";
import { AvailableDateOpeningHours } from "./get-available-dates";
import { sailsVegi } from "api/interfaces/iSails";
declare let sails: sailsVegi;
// import util from 'util';

module.exports = {
  friendlyName: 'Next available slot',

  description:
    'Get the  next available time slot for a given date and fulfilmentMethod.',

  inputs: {
    fulfilmentMethodIds: {
      type: 'ref',
      description:
        'The IDs of the fulfilmentMethods which are being requested.',
    },
  },

  exits: {
    success: {
      outputFriendlyName: 'Available slot',
    },
  },

  fn: async function (
    inputs: { fulfilmentMethodIds?: Array<number> },
    exits: { success: (unusedArg: iFulfilmentSlot) => iFulfilmentSlot }
  ) {
    let nextAvailableSlot: iFulfilmentSlot;
    let noAvailableSlot: iFulfilmentSlot;

    const fulfilmentMethods: Array<FulfilmentMethodType> =
      await FulfilmentMethod.find({
        id: inputs.fulfilmentMethodIds,
      });

    if (fulfilmentMethods.length < 1) {
      return exits.success(noAvailableSlot);
    }

    const nextAvailableDateDict: AvailableDateOpeningHours =
      await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: inputs.fulfilmentMethodIds,
      });
    const availableDates = Object.keys(nextAvailableDateDict)
      .map((dateStr) => moment.utc(dateStr, dateStrFormat))
      .sort((a, b) => (a.isBefore(b) ? -1 : 1));

    for (const nextAvailableDate of availableDates) {
      const nextAvailableDateOpeningHours =
        nextAvailableDateDict[nextAvailableDate.format(dateStrFormat)];

      if (
        !nextAvailableDateOpeningHours ||
        nextAvailableDateOpeningHours.length < 1
      ) {
        continue;
      }

      const possibleFulfilmentMethods = Array.from(
        new Set(
          nextAvailableDateOpeningHours.map(
            (openingHours) => openingHours.fulfilmentMethod
          )
        )
      );

      const allAvailableSlots: {
        [fulfilmentMethodId: string]: FulfilmentTimeWindow[];
      } = {};
      const _cb = async (fm) => {
        const x = await sails.helpers.getAvailableSlots.with({
          date: nextAvailableDate.format(dateStrFormat),
          fulfilmentMethodId: fm.id, // * for vendor fm, should not return 10 - 11am where this has 1 order
        });
        allAvailableSlots[fm.id] = x.map(
          (_islot) =>
            new FulfilmentTimeWindow({
              startTime: _islot.startTime,
              endTime: _islot.endTime,
              fulfilmentMethod: _islot.fulfilmentMethod
            })
        );
      };
      const fmToSlotsCb = possibleFulfilmentMethods.map((fm) => _cb(fm));
      const combine = Promise.all(fmToSlotsCb);
      await combine;

      let intersectedSlots: FulfilmentTimeWindow[] = null;
      for (let i = 0; i < possibleFulfilmentMethods.length; i += 1) {
        if (intersectedSlots === null) {
          intersectedSlots = allAvailableSlots[possibleFulfilmentMethods[i].id];
        } else {
          try {
            intersectedSlots = intersectTimeWindowArrays<FulfilmentTimeWindow>(
              intersectedSlots,
              allAvailableSlots[possibleFulfilmentMethods[i].id]
            );
          } catch (error) {
            sails.log.error(error);
            return exits.success(noAvailableSlot); // Dont continue as we hit an error!
          }
        }
      }

      if (intersectedSlots.length > 0) {
        const _nextAvailableSlot = intersectedSlots.sort((a, b) =>
          a.startsBefore(b) ? -1 : 1
        )[0];
        nextAvailableSlot = { // Removes class properties
          startTime: _nextAvailableSlot.startTime,
          endTime: _nextAvailableSlot.endTime,
          fulfilmentMethod: _nextAvailableSlot.fulfilmentMethod,
        };

        return exits.success(nextAvailableSlot);
      }

      continue;
    }

    // All done, no date tried had slots available.
    return exits.success(noAvailableSlot);
  },
};
