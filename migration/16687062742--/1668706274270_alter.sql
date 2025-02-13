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

ALTER TABLE `vegi`.`product` 
ADD COLUMN `ingredients` LONGTEXT AFTER `status`,
ADD COLUMN `proxyForVegiProduct` INT NULL DEFAULT NULL AFTER `ingredients`,
ADD COLUMN `vendorInternalId` varchar(255) NULL DEFAULT '' AFTER `isAvailable`,
ADD COLUMN `stockCount` INT NULL DEFAULT 0 AFTER `vendorInternalId`,
ADD COLUMN `supplier` varchar(255) NULL DEFAULT '' AFTER `stockCount`,
ADD COLUMN `brandName` varchar(255) NULL DEFAULT '' AFTER `stockCount`,
ADD COLUMN `taxGroup` varchar(255) NULL DEFAULT '' AFTER `brandName`,
ADD COLUMN `stockUnitsPerProduct` INT NULL DEFAULT 1 AFTER `taxGroup`,
ADD COLUMN `sizeInnerUnitValue` INT NULL DEFAULT 0 AFTER `stockUnitsPerProduct`,
ADD COLUMN `sizeInnerUnitType` varchar(255) NULL DEFAULT '' AFTER `sizeInnerUnitValue`,
ADD COLUMN `productBarCode` varchar(255) NULL DEFAULT '' AFTER `sizeInnerUnitType`
;

ALTER TABLE `vegi`.`product` 
ADD INDEX `proxyForVegiProductFK_idx` (`proxyForVegiProduct` ASC) VISIBLE;
;
ALTER TABLE `vegi`.`product` 
ADD CONSTRAINT `proxyForVegiProductFK`
  FOREIGN KEY (`proxyForVegiProduct`)
  REFERENCES `vegi`.`product` (`id`)
  ON DELETE SET NULL
  ON UPDATE NO ACTION;

ALTER TABLE `vegi`.`user` 
ADD COLUMN `marketingEmailContactAllowed` tinyint(1) DEFAULT 0 AFTER `phoneCountryCode`,
ADD COLUMN `marketingPhoneContactAllowed` tinyint(1) DEFAULT 0 AFTER `marketingEmailContactAllowed`,
ADD COLUMN `marketingPushContactAllowed` tinyint(1) DEFAULT 0 AFTER `marketingPhoneContactAllowed`,
ADD COLUMN `marketingNotificationUtility` INT DEFAULT 0 AFTER `marketingPushContactAllowed`,
;

-- ALTER TABLE `vegi`.`user` 
-- DROP COLUMN `verified`,
-- DROP COLUMN `walletAddress`
-- ;