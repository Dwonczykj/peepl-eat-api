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
  datetimeStrFormatExact
} from '../../../scripts/utils';

declare var sails: sailsVegi;
declare var AppLog: SailsModelType<AppLogType>;


export type LogInputs = {
  message: string,
  details: object,
};

export type LogResponse = boolean;

export type LogExits = {
  success: (unusedData: LogResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<
  LogInputs,
  LogResponse,
  LogExits
> = {
  friendlyName: 'Log',

  inputs: {
    message: {
      type: 'string',
      required: true,
    },
    details: {
      type: 'ref',
      required: false,
      defaultsTo: {},
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
    inputs: LogInputs,
    exits: LogExits
  ) {
    try {
      await AppLog.create({
        message: inputs.message,
        timestamp: moment(moment.now()).format(datetimeStrFormatExact),
        details: inputs.details,
      });
    } catch (error) {
      sails.log.error(`Error trying to log to applog: ${error}`);
      return exits.success(false);
    }

    return exits.success(true);
  },
};

module.exports = _exports;
