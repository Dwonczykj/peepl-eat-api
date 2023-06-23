/* eslint-disable no-console */
const _ = require(`lodash`);
const fs = require(`fs`);
const path = require('path');

console.log(`Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]`);

require('ts-node/register');

var Account;


module.exports = {


  friendlyName: 'Copy between databases',


  description: 'Copy data from one database to another database using the facility of the sails waterline ORM',


  fn: async function () {
    sails.log(
      `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\`NODE_ENV=development sails run copy-between-databases\`)`
    );

    _.extend(sails.hooks.http.app.locals, sails.config.http.locals);

    // return;
    // process.chdir(__dirname);
    // sails.log(`Changed Directory to: "${__dirname}"`);

    

    const wrapWithDb = (db, cb) => {
      try {
        if (db) {
          return cb().usingConnection(db);
        } else {
          return cb();
        }
      } catch (error) {
        sails.log.error(
          `copy-between-databases script threw updating the db with the child order clone: ${error}`
        );
      }
    };

    // * Query all the models from mysqlDB using waterline ORM


    const Promise = require('bluebird');

    // Promisify the sails models here for the script...
    Object.keys(sails.models).forEach((key) => {
      if (sails.models[key].query) {
        sails.models[key].query = Promise.promisify(sails.models[key].query);
      }
    });

    const modelCreateMap = {
      Account: Account,
      Address: Address,
      CategoryGroup: CategoryGroup,
      DeliveryPartner: DeliveryPartner,
      Discount: Discount,
      ESCRating: ESCRating,
      FulfilmentMethod: FulfilmentMethod,
      Like: Like,
      Notification: Notification,
      OpeningHours: OpeningHours,
      Order: Order,
      OrderItem: OrderItem,
      OrderItemOptionValue: OrderItemOptionValue,
      PostalDistrict: PostalDistrict,
      Product: Product,
      ProductCategory: ProductCategory,
      ProductOption: ProductOption,
      ProductOptionValue: ProductOptionValue,
      ProductSuggestion: ProductSuggestion,
      ProductSuggestionImage: ProductSuggestionImage,
      Refund: Refund,
      Survey: Survey,
      User: User,
      Vendor: Vendor,
      VendorCategory: VendorCategory,
      WaitingList: WaitingList,
    };
    const getKey = (lowerKey) => {
      for (var k of Object.keys(modelCreateMap)) {
        if (
          k.toLowerCase() === lowerKey ||
          k === lowerKey ||
          k.toLocaleLowerCase() === lowerKey.toLocaleLowerCase()
        ) {
          return k;
        }
      }
      return null;
    };

    //BUG: Issue might also be to do with trying to createEach on deep objects

    // const _dir = path.resolve(sails.config.appPath, `.tmp/dump_json`);
    // if (!fs.existsSync(_dir)) {
    //   await fs.mkdir(_dir, (err) => {
    //     if (err) {
    //       return console.error(err);
    //     }
    //     console.log('Directory created successfully!');
    //   });
    // }

    const oneOffSailsCall = async () => {
      try{
        await sails.getDatastore('postgres_new').transaction(async (db) => {
          const createdEntity = await sails.models["account"].create({
            walletAddress: '0x10521240ea833b144c01f042e297f48d1b1eDDDD',
            verified: false,
          }).fetch().usingConnection(db);
          const foundEntity = await sails.models['account']
            .findOne({
              id: createdEntity.id,
            })
            .usingConnection(db);
          sails.log(`New Account with walletAddress: "${foundEntity.walletAddress}"`);
        });
      } catch (error){
        sails.log.error(`Error when creating records in postgresDB for Accounts:`);
        sails.log.error(error);
      }
    };

    await oneOffSailsCall();

    const copyData = async (key) => {
      sails.log(key);
      let modelData = [];
      try{
        const mysqlDB = sails.getDatastore(); 
        modelData = await sails.models[key].find();
        // const modelData = await sails.models[key].find().usingConnection(mysqlDB);
        const numRecords = modelData.length;
        sails.log(`Copying ${numRecords} "${key}" records from MYSQL to PostGres DB`);

      } catch (error){
        sails.log.error(`Error when fetching records for key: "${key}":`);
        sails.log.error(error);
      }
      try{
        // ~ https://sailsjs.com/documentation/reference/application/sails-get-datastore
        const modelKey = getKey(key);
        if (Object.keys(modelCreateMap).includes(modelKey)){
          if (sails.getDatastore('postgres_new').config.adapter === 'sails-postgresql'){
            await sails.getDatastore('postgres_new').transaction(
              async (db) =>
                await modelCreateMap[modelKey]
                  .createEach(modelData)
                  .usingConnection(db)
              // sails.models[key].createEach(modelData).usingConnection(db)
            );
            sails.log('Copy complete');
          }else{
            sails.log.error(
              'Wrong adapter used: ' +
                sails.getDatastore('postgres_new').config.adapter
            );
          }

        }else{
          sails.log.error(
            `Model key not mapped for: ${key}`
          );
        }
      } catch (error){
        sails.log.error(`Error when creating records in postgresDB for key: "${key}":`);
        sails.log.error(error);
      }

    };

    

    // const promises = Object.keys(sails.models).map((key) => copyData(key));

    // await Promise.all(promises);

    sails.log(`Models copied success!`);

    // // Compare bootstrap version from code base to the version that was last run
    // var lastRunBootstrapInfo = await sails.helpers.fs
    //   .readJson(bootstrapLastRunInfoPath)
    //   .tolerate('doesNotExist'); // (it's ok if the file doesn't exist yet-- just keep going.)
  }

};

