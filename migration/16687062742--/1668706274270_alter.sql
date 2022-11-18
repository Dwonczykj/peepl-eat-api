-- Run this script and run the migration: safe mode

ALTER TABLE `vegi`.`deliverypartner` 
ADD COLUMN `deliveryOriginAddress` INT NULL DEFAULT NULL AFTER `deliveryFulfilmentMethod`
;

ALTER TABLE `vegi`.`vendor` 
ADD COLUMN `pickupAddress` INT NULL DEFAULT NULL AFTER `deliveryFulfilmentMethod`
;

ALTER TABLE `vegi`.`fulfilmentmethod`
ADD COLUMN `maxDeliveryDistance` DOUBLE NULL DEFAULT NULL AFTER `maxOrders`,
ADD COLUMN `fulfilmentOrigin` INT NULL DEFAULT NULL AFTER `deliveryPartner`
;

ALTER TABLE `vegi`.`order`
ADD COLUMN `deliveryAddressLatitude` DOUBLE NULL DEFAULT NULL AFTER `deliveryAddressPostCode`,
ADD COLUMN `deliveryAddressLongitude` DOUBLE NULL DEFAULT NULL AFTER `deliveryAddressLatitude`
;


