/**
 * Datastores
 * (sails.config.datastores)
 *
 * A set of datastore configurations which tell Sails where to fetch or save
 * data when you execute built-in model methods like `.find()` and `.create()`.
 *
 *  > This file is mainly useful for configuring your development database,
 *  > as well as any additional one-off databases used by individual models.
 *  > Ready to go live?  Head towards `config/env/production.js`.
 *
 * For more information on configuring datastores, check out:
 * https://sailsjs.com/config/datastores
 */
const { config } = require('dotenv');

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.STAGE_ENV === 'QA'
      ? 'https://qa-vegi.vegiapp.co.uk'
      : 'https://vegi.vegiapp.co.uk'
    : `http://localhost:${process.env.PORT}`;

config(); // load config from local .env if exists into process.env

let datastores = {
  /***************************************************************************
   *                                                                          *
   * Your app's default datastore.                                            *
   *                                                                          *
   * Sails apps read and write to local disk by default, using a built-in     *
   * database adapter called `sails-disk`.  This feature is purely for        *
   * convenience during development; since `sails-disk` is not designed for   *
   * use in a production environment.                                         *
   *                                                                          *
   * To use a different db _in development_, follow the directions below.     *
   * Otherwise, just leave the default datastore as-is, with no `adapter`.    *
   *                                                                          *
   * (For production configuration, see `config/env/production.js`.)          *
   *                                                                          *
   ***************************************************************************/

  default:
    process.env.STAGE_ENV === 'development' ||
    process.env.STAGE_ENV === 'script'
      ? {
          adapter: 'sails-postgresql',
          url: process.env.LOCAL_DATABASE_URL,
          ssl: false,
        }
      : {
          /***************************************************************************
           *                                                                          *
           * Want to use a different database during development?                     *
           *                                                                          *
           * 1. Choose an adapter:                                                    *
           *    https://sailsjs.com/plugins/databases                                 *
           *                                                                          *
           * 2. Install it as a dependency of your Sails app.                         *
           *    (For example:  npm install sails-mysql --save)                        *
           *                                                                          *
           * 3. Then pass it in, along with a connection URL.                         *
           *    (See https://sailsjs.com/config/datastores for help.)                 *
           *                                                                          *
           ***************************************************************************/
          // * add the below to your local.js to use:
          // adapter: 'sails-mysql',
          // url: 'mysql://user:password@host:port/database',
          adapter: 'sails-postgresql',
          url: process.env.DATABASE_URL,
          ssl: true,
        },
};

if (process.env['local'] || process.env['local.js']) {
  // eslint-disable-next-line no-console
  console.log(`Loading config from local env vars for config/datastores.js`);
  const _ = require(`lodash`);
  const localConfigFromDotEnv = JSON.parse(
    Buffer.from(process.env['local'] || process.env['local.js'], 'base64')
  );
  datastores = _.merge({}, datastores, localConfigFromDotEnv.config.datastores);
}

module.exports.datastores = datastores;
