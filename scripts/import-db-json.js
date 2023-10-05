/* eslint-disable no-console */
const _ = require(`lodash`);
const fs = require(`fs`);
const path = require('path');

console.log(`Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]`);

require('ts-node/register');


module.exports = {


  friendlyName: 'DB Import',


  description: 'Import db script',


  fn: async function () {


    sails.log.info(
      `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\`keep_primary_key_ids=true NODE_ENV=development sails run import-db-json\`)`
    );

    const Promise = require('bluebird');

    Object.keys(sails.models).forEach((key) => {
      if (sails.models[key].query) {
        sails.models[key].query = Promise.promisify(sails.models[key].query);
      }
    });

    const _dir = path.resolve(sails.config.appPath, `.tmp/dump_json`);
    if (!fs.existsSync(_dir)) {
      await fs.mkdir(_dir, (err) => {
        if (err) {
          sails.log.error(`${err}`);
          return;
        }
        sails.log.info('dump_json .tmp directory created successfully!');
      });
    }

    const requiredMigrations = (key, modelDataForKey) => {
      if(!modelDataForKey){
        return null;
      }
      if (key === 'user' && modelDataForKey){
        const rolledUsers = modelDataForKey.map(r => {
          // sails.log.info(`User with role: "${r.role}"`);
          if(!r.role || r.role === ""){
            r.role = 'consumer';
          }
          if(!r.fbUid){
            r.fbUid = "";
          }
          return r;
        });
        // sails.log.info(JSON.stringify(rolledUsers, null, 4));
        return rolledUsers;
      }else{
        return modelDataForKey;
      }
    };

    const importDB = async (allowWriteDB,keepPKIDs=true) => {
      if(keepPKIDs){
        sails.log.info(`Retaing primary keys in data for db import`);
      }else{
        sails.log.info(`Excluding primary keys in data for db import`);
      }
      const modelKeys = Object.keys(sails.models);
      let modelData = {};
      for (var key of modelKeys){
        if (`${key}`.includes('_')) {
          sails.log.info(`Ignoring table with name: ${key} as contains an "_"`);
        } else {
          const saveJsonPathModelNames = path.resolve(
            sails.config.appPath,
            `.tmp/dump_json/${key}.json`
          );
          
          modelData[key] = await sails.helpers.fs.readJson(saveJsonPathModelNames);

          sails.log.info(`Found ${modelData[key].length} JSON records for "${key}" model`);
        }

      }

      try {
        // ~ https://sailsjs.com/documentation/reference/application/sails-get-datastore
        if (
          sails.getDatastore().config.adapter ===
          'sails-postgresql'
        ) {
          await sails.getDatastore('postgres_new').transaction(
            async (db) => {
              for (var key of modelKeys){
                if (`${key}`.includes('_')) {
                  sails.log.info(`Ignoring table with name: ${key} as contains an "_"`);
                } else {
                  if (!modelData[key]){
                    sails.log.warn(`No modeldata exists for key: "${key}"`);
                    modelData[key] = [];
                  }
                  const existingModelData = await sails.models[key].find();
                  if (existingModelData.length > 0){
                    sails.log.info(
                      `Dropping ${existingModelData.length} existing rows from DB for key: ${key} as keep_ids set to true`
                    );
                    if(allowWriteDB){
                      await sails.models[key].destroy({
                        id: existingModelData.map(r => r.id)
                      });
                    }
                    sails.log.info(`Dropped all rows for key: "${key}"`);
                  }else{
                    sails.log.info(`No existing rows found for key: ${key} in DB`);
                  }
                  sails.log.info(
                    `Importing ${modelData[key].length} data records for key: "${key}"`
                  );
                  if(!keepPKIDs){
                    sails.log.info('Dropping PK Ids from existing data to import');
                    modelData[key] = modelData[key].map(row => {
                      // eslint-disable-next-line no-unused-vars
                      const {id,...rest} = row;
                      return rest;
                    });
                  }
                  if(allowWriteDB){
                    modelData[key] = requiredMigrations(key,modelData[key]);
                    await sails.models[key]
                      .createEach(modelData[key])
                      .usingConnection(db);
                  }
                  sails.log.info(
                    `Imported ${modelData[key].length} data records for key: "${key}"`
                  );
                }
              }
            }
            // sails.models[key].createEach(modelData).usingConnection(db)
          );
          sails.log.info('Import completed successfully.');
        } else {
          sails.log.error(
            'Wrong default DB adapter used: ' + sails.getDatastore().config.adapter + '.\n' + 
            'Should be a posgres adapter: ' +
              sails.getDatastore('postgres_new').config.adapter
          );
        }
        
      } catch (error) {
        sails.log.error(
          `Error when creating records in postgresDB:`
        );
        sails.log.error(`${error}`);
      }
    };

    let keepPrimaryKeyIds = true;
    if (Object.keys(process.env).includes('keep_primary_key_ids')) {
      keepPrimaryKeyIds = process.env.keep_primary_key_ids.toLowerCase() !== 'false';
    }
    await importDB(
      true,
      keepPrimaryKeyIds
    );
  }

};

