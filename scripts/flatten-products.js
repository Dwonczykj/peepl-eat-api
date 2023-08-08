const _ = require(`lodash`);
const fs = require(`fs`);
const path = require('path');
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

if(!process.env.NODE_ENV){
  throw Error(`Dont run script with undefined NODE_ENV, run \`NODE_ENV=development sails run flatten-products -t 20000\``);
}

require('ts-node/register');


module.exports = {


  friendlyName: 'Flatten Products',

  description: 'Flatten product option values to products',


  fn: async function () {
    sails.log(
      `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\`NODE_ENV=development sails run export-db-json\`)`
    );

    // return;
    // process.chdir(__dirname);
    // sails.log(`Changed Directory to: "${__dirname}"`);

    const Promise = require('bluebird');

    Object.keys(sails.models).forEach(function (key) {
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
        sails.log('dump_json .tmp directory created successfully!');
      });
    }

    let modelData = {};

    const findData = async (key) => {
      if (`${key}`.includes('_')) {
        sails.log.info(`Ignoring table with name: ${key} as contains an "_"`);
        return;
      }

      const saveJsonPathModelNames = path.resolve(
        sails.config.appPath,
        `.tmp/dump_json/${key}.json`
      );
      // Compare bootstrap version from code base to the version that was last run
      modelData[key] = await sails.helpers.fs.readJson(saveJsonPathModelNames);

      // const model = sails.models[key];

      // // save to memory
      // modelData[key] = await model.find();

      sails.log(`Found ${modelData[key].length} records for "${key}" model`);
    };

    const promises = Object.keys(sails.models).map((key) => findData(key));

    await Promise.all(promises);

    const existingProducts = modelData['product'];
    const existingProductOptions = modelData['productoption'];
    const existingProductOptionValues = modelData['productoptionvalue'];

    existingProducts.forEach((p) => {
      const pos = existingProductOptions.filter(
        (po) => po['product'] === p['id']
      );
      pos.forEach((po) => {
        const povs = existingProductOptionValues.filter(
          (pov) => pov['option'] === po['id']
        );
        po['values'] = povs;
      });
      p['options'] = pos;
    });

    await sails.helpers.fs.writeJson.with({
      destination: path.resolve(
        sails.config.appPath,
        `.tmp/dump_json/flatten/existingProducts.json`
      ),
      json: existingProducts,
      force: true,
    });

    const deepProductIds = existingProducts
      .filter((p) => p['options'] && p['options'].length > 1)
      .map((p) => p['id']);
    const flatProducts = existingProducts.filter(
      (p) => !deepProductIds.includes(p['id'])
    );
    const flatProductIds = flatProducts.map((p) => p['id']);

    await sails.helpers.fs.writeJson.with({
      destination: path.resolve(
        sails.config.appPath,
        `.tmp/dump_json/flatten/flatProducts.json`
      ),
      json: flatProducts,
      force: true,
    });

    sails.log(
      `Located ${existingProducts.length} products of which keep ${flatProductIds.length} and ignore ${deepProductIds.length} as they have necessary sub options`
    );

    sails.log(
      existingProducts
        .filter((p) => deepProductIds.includes(p['id']))
        .slice(1, 6)
    );

    // const deepProductIdsQueryResult = await sails.sendNativeQuery(`
    // select product.id
    // FROM ${dbName}.product product
    // left join ${dbName}.productoption productoption on product.id = productoption.product
    // where product.name is not null
    // group by product.id having NumberOfProductOptions > 1
    // order by NumberOfProductOptions desc;
    //   `);

    //   const deepProductIds = deepProductIdsQueryResult.rows();

    // const filterProductLinesWhichAreFlat = (p) => {
    //   const optionsForProduct = existingProductOptions.filter(po => po['product'] === p['id']);
    //   return optionsForProduct.length === 1;
    // };
    // const existingFlatProducts = flatProducts;
    const createProductLine = (p, po, pov) => {
      //todo: Decide whether to keep the po and povs if not from csv and want to keep that one and then perhaps set supplier name to PC for this row to avoid destroying
      if (!pov) {
        return {
          name: p['name'],
          description: p['description'],
          shortDescription: p['shortDescription'],
          imageUrl: p['imageUrl'],
          vendor: p['vendor'],
          status: p['status'],
          basePrice: p['basePrice'],
          isAvailable: p['isAvailable'],
          isFeatured: p['isFeatured'],
          priority: p['priority'],
          options: [],
          category: p['category'],
          ingredients: p['ingredients'],
          vendorInternalId: p['vendorInternalId'] || uuidv4(),
          stockCount: 0,
          stockUnitsPerProduct: 1,
          sizeInnerUnitValue: 0,
          sizeInnerUnitType: 'g',
          productBarCode: '',
          supplier: '',
          brandName: '',
          taxGroup: '',
        };
      }
      const isFromUploadCsv = pov['supplier'] !== '';
      const newProduct = {
        name: isFromUploadCsv
          ? pov['name']
          : pov['name']
          ? `${p['name']} - ${pov['name']}`
          : p['name'],
        description: pov['description'] || p['description'],
        shortDescription: p['shortDescription'],
        imageUrl: p['imageUrl'],
        vendor: p['vendor'],
        status: p['status'],
        basePrice: p['basePrice'] + pov['priceModifier'],
        isAvailable: pov['isAvailable'] && p['isAvailable'],
        isFeatured: p['isFeatured'],
        priority: p['priority'],
        options: [],
        category: p['category'],
        ingredients: p['ingredients'],
        vendorInternalId: p['vendorInternalId'] || uuidv4(),
        stockCount: pov['stockCount'],
        stockUnitsPerProduct: pov['stockUnitsPerProduct'],
        sizeInnerUnitValue: pov['sizeInnerUnitValue'],
        sizeInnerUnitType: pov['sizeInnerUnitType'],
        productBarCode: pov['productBarCode'],
        supplier: pov['supplier'],
        brandName: pov['brandName'],
        taxGroup: pov['taxGroup'],
      };
      return newProduct;
    };

    const newProductLines = [];
    flatProducts.forEach((p) => {
      const pos = existingProductOptions.filter(
        (po) => po['product'] === p['id']
      );
      const poIds = pos.map((po) => po['id']);

      const povs = existingProductOptionValues.filter((pov) =>
        poIds.includes(pov['option'])
      );

      // todo create a product for each product (p,null,null), if it has a po, then foreach po and value associated
      if (pos.length > 1) {
        for (const po of pos) {
          for (const pov of povs.filter((pov) => pov['option'] === po['id'])) {
            newProductLines.push(createProductLine(p, po, pov));
          }
        }
      } else {
        newProductLines.push(createProductLine(p, false, false));
      }
    });

    // const newProductLines = existingProductOptionValues.map(pov => {
    //   const po = existingProductOptions.filter((po) =>
    //     po['id'] === pov['option']
    //   )[0];
    //   const p = existingProducts.filter((p) =>
    //     p['id'] === po['product']
    //   )[0];
    //   if(deepProductIds.includes(p['id'])){
    //     return null;
    //   }

    //   return createProductLine(p,po,pov);
    // }).filter(newProductLine => Boolean(newProductLine));

    await sails.helpers.fs.writeJson.with({
      destination: path.resolve(
        sails.config.appPath,
        `.tmp/dump_json/flatten/newProducts.json`
      ),
      json: newProductLines,
      force: true,
    });

    //todo: Here update product lines with a supplier name of 'Purple Carrot Supplier' if we want to keep the row and its pov and pos.
    sails.log(`The first of the ${newProductLines.length} new productLines: `);
    sails.log(newProductLines[0]);

    //Destroy po and pov lines that dont have a matching id in products table anymore
    const orphanedProductOptionIds = existingProductOptions
      .filter((po) => flatProductIds.includes(po['product']))
      .map((po) => po['id']);
    const orphanedProductOptionValueIds = existingProductOptionValues
      .filter((pov) => orphanedProductOptionIds.includes(pov['option']))
      .map((pov) => pov['id']);

    const recreateProductOptionsWIds = existingProductOptions.filter(
      (po) => !flatProductIds.includes(po['product'])
    );
    const recreateProductOptionValues = existingProductOptionValues
      .filter((pov) =>
        recreateProductOptionsWIds.map((po) => po['id']).includes(pov['option'])
      )
      .map((pov) => {
        const { id, ...povOmitId } = pov;
        return povOmitId;
      });
    const recreateProductOptions = recreateProductOptionsWIds.map((po) => {
      const { id, ...poOmitId } = po;
      return poOmitId;
    });

    sails.log(`${newProductLines.length} new product records to be added`);
    sails.log(
      `There are ${orphanedProductOptionIds.length} Orphan ProductOptions to remove and ${orphanedProductOptionValueIds.length} Orphan ProductOptionValues to remove.`
    );

    await sails.models['product'].createEach(newProductLines);

    var destroyedPOVRecords = await sails.models['productoptionvalue']
      .destroy({ id: orphanedProductOptionValueIds })
      // .destroy()
      .fetch();

    var destroyedPORecords = await sails.models['productoption']
      .destroy({ id: orphanedProductOptionIds })
      // .destroy()
      .fetch();

    var destroyedRecords = await sails.models['product']
      .destroy({ id: flatProductIds })
      .fetch();

    sails.log(
      `Dropped ${destroyedRecords.length} rows from products, ${destroyedPORecords.length} from ProductOption and ${destroyedPOVRecords.length} from ProductOptionValue`
    );

    // try {
    //   const datastore = sails.getDatastore();

    //   const wrapWithDb = (db, cb) => {
    //     try {
    //       if (db) {
    //         return cb().usingConnection(db);
    //       } else {
    //         return cb();
    //       }
    //     } catch (error) {
    //       sails.log.error(
    //         `helpers.updateItemsForOrder threw updating the db with the child order clone: ${error}`
    //       );
    //     }
    //   };

    //   const createOrderTransactionDB = async (db: any) => {
    //     const newOrder = await wrapWithDb(db, () =>
    //       Order.create({
    //         total: 0.0, // * Set later!
    //         orderedDateTime: originalOrder.orderedDateTime,
    //         paidDateTime: originalOrder.paidDateTime,
    //         paymentStatus: originalOrder.paymentStatus,
    //         paymentIntentId: originalOrder.paymentIntentId,
    //         parentOrder: originalOrder.id,
    //         deliveryName: originalOrder.deliveryName,
    //         deliveryEmail: originalOrder.deliveryEmail,
    //         deliveryPhoneNumber: originalOrder.deliveryPhoneNumber,
    //         deliveryAddressLineOne: originalOrder.deliveryAddressLineOne,
    //         deliveryAddressLineTwo: originalOrder.deliveryAddressLineTwo,
    //         deliveryAddressCity: originalOrder.deliveryAddressCity,
    //         deliveryAddressPostCode: originalOrder.deliveryAddressPostCode,
    //         deliveryAddressInstructions:
    //           originalOrder.deliveryAddressInstructions,
    //         customerWalletAddress: originalOrder.customerWalletAddress,
    //         discount: originalOrder.discount ? originalOrder.discount.id : null,
    //         vendor: originalOrder.vendor ? originalOrder.vendor.id : null,
    //         fulfilmentMethod: originalOrder.fulfilmentMethod
    //           ? originalOrder.fulfilmentMethod.id
    //           : null,
    //         fulfilmentSlotFrom: originalOrder.fulfilmentSlotFrom,
    //         fulfilmentSlotTo: originalOrder.fulfilmentSlotTo,
    //         tipAmount: originalOrder.tipAmount,
    //       })
    //     ).fetch();
    //     // Strip unneccesary data from order items & copy to new order
    //     const originalOrderItems = originalOrder.items;

    //     var updatedItems = _.map(originalOrderItems, (originalOrderItem) => {
    //       originalOrderItem.order = newOrder.id;
    //       if (inputs.removeItems.includes(originalOrderItem.id)) {
    //         originalOrderItem.unfulfilled = true;
    //         originalOrderItem.unfulfilledOnOrderId = originalOrder.id;
    //       } else {
    //         originalOrderItem.unfulfilled = false;
    //         originalOrderItem.unfulfilledOnOrderId = null;
    //       }
    //       originalOrderItem.order = newOrder.id;
    //       return _.pick(originalOrderItem, [
    //         'order',
    //         'product',
    //         'optionValues',
    //         'unfulfilled',
    //         'unfulfilledOnOrderId',
    //       ]);
    //     });
    //     // Create each order item
    //     await wrapWithDb(db, () => OrderItem.createEach(updatedItems));
    //     // Calculate the order total on the backend
    //     var calculatedOrderTotal;
    //     try {
    //       calculatedOrderTotal = await sails.helpers.calculateOrderTotal.with({
    //         orderId: newOrder.id,
    //       });
    //     } catch (error) {
    //       sails.log.error(
    //         `helpers.updateItemsForOrder failed to calculateOrderTotal for new child order: ${error}`
    //       );
    //     }

    //     // Update with correct amount
    //     await wrapWithDb(db, () =>
    //       Order.updateOne(newOrder.id).set({
    //         total: calculatedOrderTotal.finalAmount,
    //       })
    //     );

    //     // Return error if vendor minimum order value not met
    //     if (
    //       calculatedOrderTotal.withoutFees <
    //       originalOrder.vendor.minimumOrderAmount
    //     ) {
    //       exits.minimumOrderAmount(
    //         'Vendor minimum order value not met on partially fulfilled updated order'
    //       );
    //       return;
    //     }

    //     await wrapWithDb(db, () =>
    //       Order.updateOne(originalOrder.id).set({
    //         restaurantAcceptanceStatus: 'partially fulfilled',
    //         completedFlag: 'void',
    //       })
    //     );
    //     // Remove items from order that were not fulfilled by vendor
    //     // await wrapWithDb(db, () =>
    //     //   OrderItem.update({
    //     //     order: newOrder.id,
    //     //     id: [...inputs.removeItems],
    //     //   }).set({ unfulfilled: true, unfulfilledOnOrderId: originalOrder.id })
    //     // ).fetch();

    //     return {
    //       validRequest: true,
    //       calculatedOrderTotal: calculatedOrderTotal.finalAmount,
    //       orderId: newOrder.id,
    //       paymentIntentID: newOrder.paymentIntentId,
    //     };
    //   };

    //   if (datastore.config.adapter === 'sails-disk') {
    //     const result = await createOrderTransactionDB(null);
    //     if (result) {
    //       return exits.success({
    //         data: result,
    //       });
    //     }
    //   } else {
    //     const result = await sails
    //       .getDatastore()
    //       .transaction(async (db) => {
    //         return await createOrderTransactionDB(db);
    //       })
    //       .intercept((issues) => {
    //         sails.log(issues);
    //         return exits.error(new Error('Error creating Order in DB'));
    //       });
    //     return exits.success({
    //       data: result,
    //     });
    //   }
    // } catch (error) {
    //   sails.log.error(`${error}`);
    //   return exits.error(
    //     new Error(
    //       'Error creating a child order in DB to set up a partial fulfilment'
    //     )
    //   );
    // }

    // // Compare bootstrap version from code base to the version that was last run
    // var lastRunBootstrapInfo = await sails.helpers.fs
    //   .readJson(bootstrapLastRunInfoPath)
    //   .tolerate('doesNotExist'); // (it's ok if the file doesn't exist yet-- just keep going.)
  }

};

