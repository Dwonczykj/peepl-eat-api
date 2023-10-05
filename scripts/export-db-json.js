/* eslint-disable no-console */
const _ = require(`lodash`);
const fs = require(`fs`);
const path = require('path');

console.log(`Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]`);

require('ts-node/register');


module.exports = {


  friendlyName: 'DB Export',


  description: 'Export db script',


  fn: async function () {


    sails.log.info(`Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\`NODE_ENV=development sails run export-db-json\`)`);

    // return;
    // process.chdir(__dirname);
    // sails.log.info(`Changed Directory to: "${__dirname}"`);

    const Promise = require('bluebird');


    Object.keys(sails.models).forEach((key) => {
      if (sails.models[key].query) {
        sails.models[key].query = Promise.promisify(sails.models[key].query);
      }
    });

    const _dir = path.resolve(
      sails.config.appPath,
      `.tmp/dump_json`
    );
    if(!fs.existsSync(_dir)){
      await fs.mkdir(_dir,(err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Directory created successfully!');
      });
    }

    const findData = async (key) => {
      sails.log.info(key);
      const modelData = await sails.models[key].find();

      const saveJsonPath = path.resolve(
        sails.config.appPath,
        `.tmp/dump_json/${key}.json`
      );

      await sails.helpers.fs.writeJson
        .with({
          destination: saveJsonPath,
          json: modelData,
          // json: {
          //   lastRunVersion: HARD_CODED_DATA_VERSION,
          //   lastRunAt: Date.now(),
          // },
          force: true,
        })
        .tolerate((err) => {
          sails.log.warn(
            'For some reason, could not write model data to .json file.' +
              '  This could be a result of a problem with your configured paths, or, if you are in production, a limitation of your hosting provider related to `pwd`.  ' +
              'As a workaround, try updating app.js to explicitly pass in `appPath: __dirname` instead of relying on `chdir`.  Current sails.config.appPath: `' +
              sails.config.appPath +
              '`.  Full error details: ' +
              err.stack
          );
        });

      sails.log.info(`Wrote ${modelData.length} rows for model: "${key}" to "${saveJsonPath}"`);

    };

    const promises = Object.keys(sails.models).map((key) => findData(key));

    const saveJsonPathModelNames = path.resolve(
      sails.config.appPath,
      `.tmp/dump_json/model_names.json`
    );

    const modelNames = Object.keys(sails.models);

    await sails.helpers.fs.writeJson
        .with({
          destination: saveJsonPathModelNames,
          json: modelNames,
          force: true,
        });

    await Promise.all(promises);

    const saveJsonDir = path.resolve(
      sails.config.appPath,
      `.tmp/dump_json`
    );

    sails.log.info(`Models written to ${saveJsonDir}`);


    // // Compare bootstrap version from code base to the version that was last run
    // var lastRunBootstrapInfo = await sails.helpers.fs
    //   .readJson(bootstrapLastRunInfoPath)
    //   .tolerate('doesNotExist'); // (it's ok if the file doesn't exist yet-- just keep going.)

  }

};

