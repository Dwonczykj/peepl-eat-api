ALTER TABLE `vegi`.`productoptionvalue`
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