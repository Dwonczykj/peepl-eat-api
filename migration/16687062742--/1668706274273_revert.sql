-- ALTER TABLE table_name 
-- DROP [COLUMN] column_name_1, 
-- DROP [COLUMN] column_name_2, 

ALTER TABLE `vegi`.`deliverypartner` 
DROP COLUMN `deliveryOriginAddress`,
;

ALTER TABLE `vegi`.`vendor` 
DROP COLUMN `pickupAddress`,
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