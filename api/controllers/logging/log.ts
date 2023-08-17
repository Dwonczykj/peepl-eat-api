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

export enum LogLevel {
  wtf,
  silly,
  trace,
  verbose,
  debug,
  info,
  warn,
  error
}

export const logLevelDict = {
  error: LogLevel.error,
  warn: LogLevel.warn,
  info: LogLevel.info,
  debug: LogLevel.debug,
  verbose: LogLevel.verbose,
  trace: LogLevel.trace,
  silly: LogLevel.silly,
  wtf: LogLevel.wtf,
};

const logLevel = sails.config.log.level;

/**
 * The function checks if a given log level is superior to another log level.
 * @param {string} appLogLevel - The `appLogLevel` parameter represents the log level of the
 * application, while the `logLevelToLog` parameter represents the log level that you want to log.
 * @param {string} logLevelToLog - The `logLevelToLog` parameter is a string that represents the log
 * level that you want to log.
 * @returns a boolean value. It returns true if the `appLogLevel` is equal to or lower than the
 * `logLevelToLog` based on their positions in the `logLevelDict` object. Otherwise, it returns false.
 */
const isSuperiorLog = (appLogLevel: string, logLevelToLog: string) => {
  if(Object.keys(logLevelDict).includes(appLogLevel.toLowerCase()) && Object.keys(logLevelDict).includes(logLevelToLog.toLowerCase())){
    return Object.keys(logLevelDict).indexOf(appLogLevel.toLowerCase()) <= Object.keys(logLevelDict).indexOf(logLevelToLog.toLowerCase());
  }
  return false;
};


export type LogInputs = {
  message: string;
  details: {
    level?: keyof typeof logLevelDict;
  };
  level?: keyof typeof logLevelDict;
  label?: string;
};

export type LogResponse = boolean;

export type LogExits = {
  success: (unusedData: LogResponse) => any;
  issue: (unusedErr: Error | String) => void;
  notFound: () => void;
  error: (unusedErr: Error | String) => void;
  badRequest: (unusedErr: Error | String) => void;
};

const _exports: SailsActionDefnType<LogInputs, LogResponse, LogExits> = {
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
    level: {
      type: 'string',
      defaultsTo: '',
    },
    label: {
      type: 'string',
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

  fn: async function (inputs: LogInputs, exits: LogExits) {
    var level = LogLevel.trace;
    if (
      inputs.level &&
      Object.keys(logLevelDict).includes(
        `${inputs.level}`.toLowerCase()
      )
    ) {
      level = logLevelDict[`${inputs.level}`.toLowerCase()];
    } else if (
      inputs.details &&
      Object.keys(inputs.details).includes('level') &&
      Object.keys(logLevelDict).includes(
        `${inputs.details.level}`.toLowerCase()
      )
    ) {
      level = logLevelDict[`${inputs.details.level}`.toLowerCase()];
    }
    try {
      await AppLog.create({
        message: inputs.message,
        timestamp: moment(moment.now()).format(datetimeStrFormatExact),
        level: level.toString(),
        label: inputs.label,
        details: inputs.details,
      });
    } catch (error) {
      sails.log.error(`Error trying to log[level:"${level}"] to applog: ${error}`);
      return exits.success(false);
    }
    try {
      if (level === LogLevel.error) {
        await sails.helpers.sendEmailToSupport.with({
          subject: `vegi-app error logged [${Date.now()}]`,
          message: `${inputs.message}\n\nDetails:\n${inputs.details}`,
        });
      }
    } catch (error) {
      sails.log.error(
        `Error trying to log error as support email from applog handler: ${error}`
      );
    }

    return exits.success(true);
  },
};

module.exports = _exports;
