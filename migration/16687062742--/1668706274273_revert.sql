-- ALTER TABLE table_name 
-- DROP [COLUMN] column_name_1, 
-- DROP [COLUMN] column_name_2, 

ALTER TABLE `vegi`.`deliverypartner` 
DROP COLUMN `deliveryOriginAddress`,
;

ALTER TABLE `vegi`.`vendor` 
DROP COLUMN `pickupAddress`,
ADD COLUMN `pickupAddressLineOne` varchar(255) NULL DEFAULT '' AFTER `phoneNumber`,
ADD COLUMN `pickupAddressLineTwo` varchar(255) NULL DEFAULT '' AFTER `pickupAddressLineOne`,
ADD COLUMN `pickupAddressCity` varchar(255) NULL DEFAULT '' AFTER `pickupAddressLineTwo`,
ADD COLUMN `pickupAddressPostCode` varchar(255) NULL DEFAULT '' AFTER `pickupAddressCity`,
ADD COLUMN `pickupAddressLatitude` DOUBLE NULL DEFAULT 0.0 AFTER `pickupAddressPostCode`,
ADD COLUMN `pickupAddressLongitude` DOUBLE NULL DEFAULT 0.0 AFTER `pickupAddressLatitude`
;

ALTER TABLE `vegi`.`fulfilmentmethod` 
DROP COLUMN `maxDeliveryDistance`,
DROP COLUMN `fulfilmentOrigin`
;

ALTER TABLE `vegi`.`order`
DROP COLUMN `deliveryAddressLatitude`,
DROP COLUMN `deliveryAddressLongitude`
;

DROP TABLE `vegi`.`address`;

ALTER TABLE `vegi`.`product`
DROP COLUMN `ingredients`,
DROP COLUMN `vendorInternalId`,
DROP COLUMN `stockCount`,
DROP COLUMN `supplier`,
DROP COLUMN `brandName`,
DROP COLUMN `taxGroup`,
DROP COLUMN `stockUnitsPerProduct`,
DROP COLUMN `sizeInnerUnitValue`,
DROP COLUMN `sizeInnerUnitType`,
DROP COLUMN `productBarCode`
;

DROP TABLE `vegi`.`survey`;
DROP TABLE `vegi`.`waitinglist`;
DROP TABLE `vegi`.`like`;
DROP TABLE `vegi`.`escrating`;
DROP TABLE `vegi`.`escexplanation`;
DROP TABLE `vegi`.`account`;