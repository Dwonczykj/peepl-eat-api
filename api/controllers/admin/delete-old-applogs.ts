import axios from 'axios';
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import moment from 'moment';

import {
  sailsModelKVP,
  SailsModelType,
  sailsVegi,
} from '../../interfaces/iSails';
import {
  SailsActionDefnType,
  AppLogType,
  DateString,
  dateStrFormat,
  datetimeStrFormat
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var AppLog: SailsModelType<AppLogType>;


/**
 * The above type represents the inputs for deleting old app logs, including an optional upToDate
 * parameter.
 * @property {DateString} upToDate - An optional parameter that specifies the date up to which the app
 * logs should be deleted. It should be provided in the format of a string representing a date // 'YYYY-MM-DD' i.e. "2022-03-24".
 */
export type DeleteOldApplogsInputs = {
  upToDate?: DateString | null | undefined,
};

export type DeleteOldApplogsResponse = {
  logsDeleted: number;
};

export type DeleteOldApplogsExits = {
  success: (unusedData: DeleteOldApplogsResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  DeleteOldApplogsInputs,
  DeleteOldApplogsResponse,
  DeleteOldApplogsExits
> = {
  friendlyName: 'DeleteOldApplogs',

  inputs: {
    upToDate: {
      type: 'string',
      required: false,
      defaultsTo: '',
    },
  },

  exits: {
    success: {
      data: false,
    },
    notFound: {
      statusCode: 404,
    },
    issue: {
      statusCode: 403,
    },
    badRequest: {
      responseType: 'badRequest',
    },
    error: {
      statusCode: 500,
    },
  },

  fn: async function (
    inputs: DeleteOldApplogsInputs,
    exits: DeleteOldApplogsExits
  ) {

    try{
      const rowsToDelete: Array<any> = await AppLog.find({
        timestamp: {
          '<':
            inputs.upToDate ||
            new Date().addHours(-24) ||
            moment.utc().toDate().addHours(-24).format(),
        },
      });
      sails.log.info(rowsToDelete);
    } catch (error) {
      sails.log.error(error);
      return exits.error('Failed to find applogs for dropping');
    }

    try {
      const deletedRows: Array<any> = await AppLog.destroy({
        timestamp: {
          '<':
            inputs.upToDate ||
            new Date().addHours(-24) ||
            moment
              .utc()
              .toDate()
              .addHours(-24)
              .format(),
        },
      }).fetch();
      return exits.success({
        logsDeleted: deletedRows.length,
      });
    } catch (error) {
      sails.log.error(`Unable to delete old AppLogs with error: [${error}]. See next log for more detail:`);
      sails.log.error(error);
      return exits.error('Failed to delete old applogs');
    }

  },
};

module.exports = _exports;
