declare var OpeningHours: any;
declare var FulfilmentMethod: any;
import {
  dateStrFormat,
  getNextWeekday,
  timeStrFormat,
  OpeningHoursType,
  FulfilmentMethodType,
} from "../../scripts/utils";
import moment, { Moment } from 'moment';
import _ from 'lodash';
import { AvailableDateOpeningHours } from "./get-available-dates";

export type NextAvailableDateHelperReturnType = {
  nextAvailableDate: string,
  nextAvailableOpeningHours: Array<OpeningHoursType>,
}

// const moment = require('moment');
module.exports = {
  friendlyName: "Next available date",

  description:
    "Get the next available date for a given list of fulfilmentMethods.",

  inputs: {
    fulfilmentMethodIds: {
      type: "ref",
      description:
        "The List of IDs of the fulfilmentMethods which are being requested.",
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Next available slot",
    },
  },

  fn: async function (
    inputs: { fulfilmentMethodIds?: Array<number> },
    exits: {
      success: (
        unused: NextAvailableDateHelperReturnType
      ) => NextAvailableDateHelperReturnType;
    }
  ) {
    const intersectionDates: AvailableDateOpeningHours =
      await sails.helpers.getAvailableDates.with({
        fulfilmentMethodIds: inputs.fulfilmentMethodIds,
      });

    const nextAvailableDate = _.min(
      Object.keys(intersectionDates).map((_dt) =>
        moment.utc(_dt, dateStrFormat)
      )
    );
    const nextAvailableDateStr = nextAvailableDate.format(dateStrFormat);

    // Send back the result through the success exit.
    return exits.success({
      nextAvailableDate: nextAvailableDateStr,
      nextAvailableOpeningHours: intersectionDates[nextAvailableDateStr],
    });
  },
};

