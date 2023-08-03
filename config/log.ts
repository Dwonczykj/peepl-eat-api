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
import { createLogger, format, transports, LeveledLogMethod } from 'winston';
const { combine, timestamp, colorize, label, printf, align } = format;
import { SPLAT }  from 'triple-beam';
import { isObject } from 'lodash';
import path from 'path';


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

// ~ node_modules/winston/lib/winston/config/index.d.ts:20
// ~ https://stackoverflow.com/a/67379878
enum LogLevel {
  trace,
  debug,
  info,
  warn,
  error
}

const _logLevel = {
  error: LogLevel.error,
  warn: LogLevel.warn,
  info: LogLevel.info,
  debug: LogLevel.debug,
  trace: LogLevel.trace
};

// ~ https://stackoverflow.com/a/10341078, // ~ https://stackoverflow.com/a/32782200
// ~ https://github.com/winstonjs/winston#usage
// const logger2 = winston.createLogger({
//   // level: 'verbose',
//   levels: _logLevel,

//   // format: winston.format.json(),
//   // ~ https://stackoverflow.com/a/48573091
//   format: format.combine(
//     // ! Note that format.timestamp has to come before format.json (if you're using that latter)
//     winston.format.timestamp(),
//     // winston.format.timestamp({ format: 'MM-YY-DD' }),
//     winston.format.json()
//   ),
//   defaultMeta: { service: 'user-service' },
//   transports: [
//     // new winston.transports.Console(),
//     // ~ Console transport requires the outputCapture key in launch.json ~ https://github.com/winstonjs/winston/issues/1544#issuecomment-472199224
//     new winston.transports.Console({
//       // format: winston.format.simple(),
//       format: combine(
//         all(),
//         label({ label: version }),
//         timestamp(),
//         colorize(),
//         align(),
//         printf((info) =>
//           formatObject(info.message).includes('redis')
//             ? null
//             : `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(
//                 info.message
//               )}`
//         )
//       ),
//       level: 'verbose',
//       debugStdout: true,
//     }),
//     new winston.transports.File({
//       filename: path.resolve(
//         sails ? sails.config.appPath : path.dirname(__dirname),
//         'logs/error/error.log',
//       ),
//       level: 'error',
//     }),
//     new winston.transports.File({
//       filename: path.resolve(
//         sails ? sails.config.appPath : path.dirname(__dirname),
//         'logs/activity/activity.log'
//       ),
//       level: 'info',
//     }),
//     //
//     // - Write all logs with importance level of `error` or less to `error.log`
//     // - Write all logs with importance level of `verbose` or less to `combined.log`
//     //
//     new winston.transports.File({
//       filename: 'error.log',
//       level: 'error',
//       maxsize: 5 * 1028,
//       tailable: true,
//     }),
//     new winston.transports.File({
//       filename: 'combined.log',
//       level: 'verbose',
//       maxsize: 5 * 1028,
//       tailable: true,
//     }),
//   ],
// });

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// logger2.add(
//   // ~ Console transport requires the outputCapture key in launch.json ~ https://github.com/winstonjs/winston/issues/1544#issuecomment-472199224
//   new winston.transports.Console({
//     // format: winston.format.simple(),
//     format: combine(
//       all(),
//       label({ label: version }),
//       timestamp(),
//       colorize(),
//       align(),
//       printf(
//         (info) =>
//           formatObject(info.message).includes('redis') ? null : `${info.timestamp} [${
//             info.label
//           }] ${info.level}: ${formatObject(info.message)}`
//       )
//     ),
//     level: 'verbose',
//     debugStdout: true,
//   })
// );
// if (/*process.env.NODE_ENV !== 'production'*/true) {
// }

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        // ! Note that format.timestamp has to come before format.json (if you're using that latter)
        // Use the filter to ignore log messages containing "redis"
        winston.format((info) => {
          if (
            info.message &&
            info.message.toString().toLowerCase().includes('redis')
          ) {
            return false;
          }
          return info;
        })(),
        winston.format.timestamp(),
        winston.format.colorize(),
        // winston.format.timestamp({ format: 'MM-YY-DD' }),
        winston.format.printf((info) => {
          return `${info.timestamp} ${info.level}: ${info.message}`;
        })
        // winston.format.simple()
        // winston.format.json()
      ),
      level: 'verbose',
      debugStdout: true,
    }),
    new winston.transports.File({
      filename: path.resolve(
        path.dirname(__dirname),
        'logs/error/error.log'
      ),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.resolve(
        path.dirname(__dirname),
        'logs/activity/activity.log'
      ),
      level: 'verbose',
      maxsize: 5 * 1028,
    }),
  ],
});

// eslint-disable-next-line no-console
// console.log(`Running logger with levels: ${JSON.stringify(logger2.levels)}`);

module.exports.log = {
  custom: logger,
  inspect: false,
};

// module.exports.stream = {
//   write: function (message, encoding) {
//     logger2.info(message);
//     // eslint-disable-next-line no-console
//     console.log('message=', message);
//   },
// };
// ~ node_modules/captains-log/lib/write.js:30
// ~ -> node_modules/winston/lib/winston/create-logger.js:73
// ~ -> node_modules/winston/node_modules/readable-stream/lib/_stream_writable.js:381
// ~ -/-> node_modules/winston/node_modules/readable-stream/lib/_stream_transform.js:149
logger.info(`TESTING LOGGER... from config/log.ts`);

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
