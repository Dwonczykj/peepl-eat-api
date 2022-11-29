-- Run this script and run the migration: safe mode

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


