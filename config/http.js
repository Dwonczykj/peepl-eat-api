/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */
// const helmet = require("helmet");

module.exports.http = {
  // Below code doesn't work within views, not sure why
  locals: {
    filters: {
      toPounds: function (value) {
        if (!value) {
          return '£0';
        }
        value = '£' + (value / 100).toFixed(2);
        value = value.toString();
        return value;
      },
    },
  },

  /****************************************************************************
   *                                                                           *
   * Sails/Express cache for every HTTP request.                   *
   * The number of milliseconds to cache static assets when your app is running in a 'production' environment. *
   * More specifically, this is the "max-age" that will be included in the  *
   * "Cache-Control" header when responding to requests for static assets *
   * —i.e. any flat files like images, scripts, stylesheets, etc. that are served by Express' static middleware.        *
   *                                                                           *
   * https://sailsjs.com/documentation/reference/configuration/sails-config-http#?properties                     *
   *                                                                           *
   ****************************************************************************/
  cache: 30000, // 31557600000 = 1 year

  /****************************************************************************
   *                                                                           *
   * Sails/Express middleware to run for every HTTP request.                   *
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
   *                                                                           *
   * https://sailsjs.com/documentation/concepts/middleware                     *
   *                                                                           *
   ****************************************************************************/

  middleware: {
    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP requests.           *
     * (This Sails app's routes are handled by the "router" middleware below.)  *
     *                                                                          *
     ***************************************************************************/

    order: [
      // 'helmet',
      'myRequestLogger',
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],

    // ~ https://stackoverflow.com/a/32474918
    myRequestLogger: function (req, res, next) {
      res.on('finish', () => {
        if (req.url.includes('logging/log')) {
          sails.log.silly(`🔗${res.statusCode === 200 ? '✅' : res.statusCode >= 300 && res.statusCode <= 400 ? '👉' : '⛔️'}RESPONSE [${req.method}]${req.originalUrl} -> ${res.statusCode} (${res.statusMessage})`);
        } else {
          sails.log.info(
            `🔗${
              res.statusCode === 200
                ? '✅'
                : res.statusCode >= 300 && res.statusCode <= 400
                ? '👉'
                : '⛔️'
            }RESPONSE [${req.method}]${req.originalUrl} -> ${res.statusCode} (${
              res.statusMessage
            })`
          );
        }
        // sails.log(res.outputData);
        // sails.log(res.connection);
        // sails.log(res.headersSent);
      });
      return next();
    },

    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests.       *
     *                                                                          *
     * https://sailsjs.com/config/http#?customizing-the-body-parser             *
     *                                                                          *
     ***************************************************************************/

    /* helmet: (function(){
      // Use the `helmet` package to help secure your Express/Sails app.
      var middlewareFn = helmet();
      return middlewareFn;
    })()//</self-calling function ::> */

    // ~ https://stackoverflow.com/a/48083356
    bodyParser: (function _configureBodyParser() {
      var skipper = require('skipper');
      var middlewareFn = skipper({
        strict: true,
        maxTimeToBuffer: 150000,
      });
      return middlewareFn;
    })(),
  },
};
