/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

const { version } = require('../package');

import winston from 'winston';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, colorize, label, printf, align } = format;
import { SPLAT }  from 'triple-beam';
import { isObject } from 'lodash';


function formatObject(param) {
  if (isObject(param)) {
    let jsonStr = '';
    try{
      jsonStr = JSON.stringify(param);
    } catch (err) {
      jsonStr = `${param}`;
    }
    return jsonStr;
  }
  return param;
}

// Ignore log messages if they have { private: true }
const all = format((info) => {
  const splat = info[SPLAT] || [];
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.message = `${message} ${rest}`;
  return info;
});

// ~ https://stackoverflow.com/a/10341078, // ~ https://stackoverflow.com/a/32782200
// ~ https://github.com/winstonjs/winston#usage
const logger2 = winston.createLogger({
  level: 'verbose',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `verbose` or less to `combined.log`
    //
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: 5 * 1028,
      tailable: true,
    }),
    new winston.transports.File({
      filename: 'combined.log',
      level: 'verbose',
      maxsize: 5 * 1028,
      tailable: true,
    }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
logger2.add(
  // ~ Console transport requires the outputCapture key in launch.json ~ https://github.com/winstonjs/winston/issues/1544#issuecomment-472199224
  new winston.transports.Console({
    // format: winston.format.simple(),
    format: combine(
      all(),
      label({ label: version }),
      timestamp(),
      colorize(),
      align(),
      printf(
        (info) =>
          formatObject(info.message).includes('redis') ? null : `${info.timestamp} [${
            info.label
          }] ${info.level}: ${formatObject(info.message)}`
      )
    ),
    level: 'verbose',
    debugStdout: true,
  })
);
// if (/*process.env.NODE_ENV !== 'production'*/true) {
// }

module.exports.log = {
  custom: logger2,
  inspect: false,
  level: 'verbose',
};

// module.exports.log = {
//   /***************************************************************************
//    *                                                                          *
//    * Valid `level` configs: i.e. the minimum log level to capture with        *
//    * sails.log.*()                                                            *
//    *                                                                          *
//    * The order of precedence for log levels from lowest to highest is:        *
//    * silly, verbose, info, debug, warn, error                                 *
//    *                                                                          *
//    * You may also set the level to "silent" to suppress all logs.             *
//    *                                                                          *
//    ***************************************************************************/

//   level: 'verbose',
//   // // colorize: true, // ~ https://stackoverflow.com/a/10341078
//   // // silent: true, // ~ https://stackoverflow.com/a/10341078
//   // timestamp: true, // ~ https://stackoverflow.com/a/10341078
//   // transports: [new winston.transports.Console({ timestamp: true })],
// };
