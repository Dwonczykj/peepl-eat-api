-- Run this script and run the migration: safe mode

ALTER TABLE `vegi`.`deliverypartner` 
ADD COLUMN `deliveryOriginAddress` INT NULL DEFAULT NULL AFTER `deliveryFulfilmentMethod`
;

ALTER TABLE `vegi`.`vendor` 
ADD COLUMN `pickupAddress` INT NULL DEFAULT NULL AFTER `deliveryFulfilmentMethod`,
DROP COLUMN `pickupAddressLineOne`,
DROP COLUMN `pickupAddressLineTwo`,
DROP COLUMN `pickupAddressCity`,
DROP COLUMN `pickupAddressPostCode`,
DROP COLUMN `pickupAddressLatitude`,
DROP COLUMN `pickupAddressLongitude`
;

ALTER TABLE `vegi`.`fulfilmentmethod`
ADD COLUMN `maxDeliveryDistance` DOUBLE NULL DEFAULT NULL AFTER `maxOrders`,
ADD COLUMN `fulfilmentOrigin` INT NULL DEFAULT NULL AFTER `deliveryPartner`
;

ALTER TABLE `vegi`.`order`
ADD COLUMN `deliveryAddressLatitude` DOUBLE NULL DEFAULT NULL AFTER `deliveryAddressPostCode`,
ADD COLUMN `deliveryAddressLongitude` DOUBLE NULL DEFAULT NULL AFTER `deliveryAddressLatitude`
;

ALTER TABLE `vegi`.`productoptionvalue` 
ADD COLUMN `stockCount` INT NULL DEFAULT 0 AFTER `isAvailable`,
ADD COLUMN `supplier` varchar(255) NULL DEFAULT '' AFTER `stockCount`,
ADD COLUMN `brandName` varchar(255) NULL DEFAULT '' AFTER `stockCount`,
ADD COLUMN `taxGroup` varchar(255) NULL DEFAULT '' AFTER `brandName`,
ADD COLUMN `stockUnitsPerProduct` INT NULL DEFAULT 1 AFTER `taxGroup`,
ADD COLUMN `sizeInnerUnitValue` INT NULL DEFAULT 0 AFTER `stockUnitsPerProduct`,
ADD COLUMN `sizeInnerUnitType` varchar(255) NULL DEFAULT '' AFTER `sizeInnerUnitValue`,
ADD COLUMN `productBarCode` varchar(255) NULL DEFAULT '' AFTER `sizeInnerUnitType`
;
