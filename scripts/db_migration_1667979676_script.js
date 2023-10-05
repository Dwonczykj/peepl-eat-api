// scripts/db_migration_1667979676_script.js
const util = require('util');
require('ts-node/register');

// ~ https://sailsjs.com/documentation/concepts/shell-scripts
//$ NODE_ENV=script node ./node_modules/sails/bin/sails run db_migration_1667979676_script
//! NODE_ENV=development node ./node_modules/sails/bin/sails run db_migration_1667979676_script
module.exports = {
  friendlyName: 'db_migration_1667979676_script', // ~ http://timestamp.online/timestamp/{your-timestamp} || python >>> import time; time.time()
  description: 'One off script to run to update db after models update',

  inputs: {},

  exits: {
    success: {},
    error: {},
  },

  fn: async function (inputs, exits) {
    sails.log.info(
      `Running in node_env: ${
        process.env.NODE_ENV
      } with sails.locals:\n${util.inspect(sails.config.datastores, {
        depth: null,
      })} <- read from locals.js\n---------------------------------`
    );

    /**
     * ! No bootstapping occurs by default for script running as this would destory production data if run on a production db.
     */
   
    try{
      let generalCategoryGroupArr = await CategoryGroup.find(
        {
          name: 'General',
          forRestaurantItem: false,
        }
      );
      let generalCategoryGroup;
      if (!generalCategoryGroupArr || generalCategoryGroupArr.length < 1) {
        generalCategoryGroup = await CategoryGroup.create({
          name: 'General',
          imageUrl:
            'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/db8c6bb1-5b85-496d-ae15-19f6455c57ac.png',
          forRestaurantItem: false,
        }).fetch();
      } else {
        generalCategoryGroup = generalCategoryGroupArr[0];
      }
      
      let mainRestaurantCategoryGroupArr = await CategoryGroup.find({
        name: 'Main',
        forRestaurantItem: true,
      });
      let mainRestaurantCategoryGroup;
      if (
        !mainRestaurantCategoryGroupArr ||
        mainRestaurantCategoryGroupArr.length < 1
      ) {
        mainRestaurantCategoryGroup = await CategoryGroup.create({
          name: 'Main',
          imageUrl:
            'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/db8c6bb1-5b85-496d-ae15-19f6455c57ac.png',
          forRestaurantItem: true,
        });
      }else{
        mainRestaurantCategoryGroup = mainRestaurantCategoryGroupArr[0];
      }
    
      if (!generalCategoryGroup) {
        return exits.error('CategoryGroup not Found');
      }

      sails.log.info(`General Category Group Exists: ${util.inspect(generalCategoryGroup, {depth: null})}`);
      
      const vendors = await Vendor.find().populate('productCategories');
      const vendorsToUpdate = vendors.filter((vendor) => {
        if (vendor.productCategories) {
          return !vendor.productCategories
            .map((pc) => pc.name)
            .includes('General');
        } else {
          return true;
        }
      });

      const newProductCategories = vendorsToUpdate.map((vendor) => {
        return {
          name: 'General',
          categoryGroup: generalCategoryGroup.id,
          imageUrl:
            'https://vegiapp-s3bucket.s3.eu-west-2.amazonaws.com/db8c6bb1-5b85-496d-ae15-19f6455c57ac.png',
          products: [],
          vendor: vendor.id,
        };
      });

      sails.log.info(`Creating new product categories: ${util.inspect(newProductCategories, {depth: null})}`);
      let _newProdCats;
      if(newProductCategories.length > 0){
        _newProdCats = await ProductCategory.createEach(
          newProductCategories
        ).fetch();
        sails.log.info(`Product Categories created for each vendor`);
      } else {
        sails.log.info(`Product Categories already exists for each vendor`);
      }
      _newProdCats = await ProductCategory.find({
        name: 'General',
        categoryGroup: generalCategoryGroup.id,
      }).populate('vendor');

      const products = await Product.find().populate('category&vendor');
      const productsToUpdate = products
        .filter((product) => {
          return !product.category && product.vendor;
        })
        .map((p) => {
          p.category = _newProdCats.filter(
            (npc) => npc.vendor.id === p.vendor.id
          )[0].id;
          p.vendor = p.vendor.id;
          return p;
        });
      if (productsToUpdate.length > 0){
        sails.log.info(
          `Updating products [${productsToUpdate.length}]: ${util.inspect(productsToUpdate[0], {
            depth: null,
          })}`
        );
        for (const prod of productsToUpdate) {
          await Product.update(prod.id).set({
            // name: prod.name,
            // description: prod.description,
            // shortDescription: prod.shortDescription,
            // basePrice: prod.basePrice,
            // imageUrl: prod.imageUrl,
            // isAvailable: prod.isAvailable,
            // priority: prod.priority,
            // isFeatured: prod.isFeatured,
            // status: prod.status,
            // vendor: prod.vendor,
            // options: prod.options,
            category: prod.category,
          });
        }
        const updatedProducts = await Product.find(productsToUpdate.map(p => p.id)).populate('category&vendor');

        sails.log.info(
          `Products updated for each vendor [${
            updatedProducts.length
          }]: ${util.inspect(updatedProducts[0], { depth: 2 })}`
        );
      }

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};

// Run this script vs the sails-disk db, ensure this is configured to run against a local db first.
