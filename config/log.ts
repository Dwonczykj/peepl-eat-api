/* eslint-disable no-console */
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
// import { createLogger, format, transports, LeveledLogMethod } from 'winston';
// const { combine, timestamp, colorize, label, printf, align } = format;
// import { Pool } from 'pg';
// import Transport from 'winston-transport';
// import { SPLAT }  from 'triple-beam';
// import { isObject } from 'lodash';
import path from 'path';
import fs from 'fs';

// ~ node_modules/winston/lib/winston/config/index.d.ts:20
// ~ https://stackoverflow.com/a/67379878
// enum LogLevel {
//   trace,
//   debug,
//   info,
//   warn,
//   error
// }

// const _logLevel = {
//   error: LogLevel.error,
//   warn: LogLevel.warn,
//   info: LogLevel.info,
//   debug: LogLevel.debug,
//   trace: LogLevel.trace
// };

// class PostgresTransport extends Transport {
//   pool: Pool;

//   constructor(opts: winston.transport.TransportStreamOptions & {connectionString: string}) {
//     super(opts);
//     // this.pool = new Pool(opts.connection); // connection: {host: string, user: string, password: string, database: string,}
//     console.log(`Logging transport register to DB at "${opts.connectionString}"`);
//     this.pool = new Pool({
//       connectionString: opts.connectionString,
//     });
//   }

//   log(info: { level: keyof typeof _logLevel, message: string, meta: any, }, callback) {
//     setImmediate(() => this.emit('logged', info));

//     const text = 'INSERT INTO logs(level, message, meta) VALUES($1, $2, $3)';
//     const values = [info.level, info.message, info.meta];

//     this.pool.query(text, values, (err, res) => {
//       if (err) {
//         console.error(err.stack);
//       }
//     });

//     callback();
//   }
// }


// function formatObject(param) {
//   if (isObject(param)) {
//     let jsonStr = '';
//     try{
//       jsonStr = JSON.stringify(param);
//     } catch (err) {
//       jsonStr = `${param}`;
//     }
//     return jsonStr;
//   }
//   return param;
// }

// // Ignore log messages if they have { private: true }
// const all = format((info) => {
//   const splat = info[SPLAT] || [];
//   const message = formatObject(info.message);
//   const rest = splat.map(formatObject).join(' ');
//   info.message = `${message} ${rest}`;
//   return info;
// });

// ~ https://stackoverflow.com/a/10341078, // ~ https://stackoverflow.com/a/32782200
// ~ https://github.com/winstonjs/winston#usage

const loggingActivityFd = path.resolve(
  path.dirname(__dirname),
  'logs/activity'
);
const loggingActivityFp = path.resolve(
  loggingActivityFd,
  '/activity.log'
);
const loggingErrorsFd = path.resolve(
  path.dirname(__dirname),
  'logs/error'
);
const loggingErrorsFp = path.resolve(loggingErrorsFd, '/error.log');


// if (!fs.existsSync(loggingActivityFd)) {
//   console.log(`MKDIR "${loggingActivityFd}"`);
//   fs.mkdirSync(path.dirname(loggingActivityFd));
//   if (!fs.existsSync(loggingActivityFd)) {
//     throw new Error(`Unable to create logging directory: ${loggingActivityFd}`);
//   }
// }

// if (!fs.existsSync(loggingErrorsFd)) {
//   console.log(`MKDIR "${loggingErrorsFd}"`);
//   fs.mkdirSync(path.dirname(loggingErrorsFd));
//   if (!fs.existsSync(loggingErrorsFd)) {
//     throw new Error(`Unable to create logging directory: ${loggingErrorsFd}`);
//   }
// }

// console.log(
//   `Attempting to log info logs to path: "${loggingActivityFp}" & "${loggingErrorsFp}"`
// );


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
    // new winston.transports.File({
    //   filename: loggingErrorsFp,
    //   level: 'error',
    // }),
    // new winston.transports.File({
    //   filename: loggingActivityFp,
    //   level: 'verbose',
    //   maxsize: 5 * 1028,
    // }),
    // new winston.transports.PostgreSQL(dbOptions),
    // new CustomPostgresTransport({ db }),
    // new PostgresTransport({
    //   connectionString: process.env.DATABASE_URL,
    // }),
  ],
});

// logger.add(new winston.transports.PostgreSQL(dbOptions));

// eslint-disable-next-line no-console
// console.log(`Running logger with levels: ${JSON.stringify(logger2.levels)}`);

// NOTE to add sails logs, we might be able to convert this to:
// module.exports.log = async function () {
  // ~ https://github.com/balderdashy/sails/issues/3773#issuecomment-230929938
// module.exports.log = function () {
//   console.log(sails ? `sails loaded for sails hook log: ${Object.keys(sails)}` : 'No sails present in log async function');
//   sails.log.verbose('HELLO MOTHER FUCKIN WORLD');
//   console.log('HELLO MOTHER FUCKIN WORLD FROM CONSOLE');
//   return {
//     custom: logger,
//     inspect: false,
//   };
// }();

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
