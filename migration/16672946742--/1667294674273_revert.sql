-- ALTER TABLE table_name 
-- DROP [COLUMN] column_name_1, 
-- DROP [COLUMN] column_name_2, 

ALTER TABLE `vegi`.`deliverypartner` 
DROP UNIQUE INDEX `name_UNIQUE`,
DROP UNIQUE INDEX `id_UNIQUE`;
DROP COLUMN `type`,
DROP COLUMN `description`,
DROP COLUMN `walletAddress`,
DROP COLUMN `imageUrl`,
DROP COLUMN `rating`,
DROP COLUMN `deliversToPostCodes`,
;

ALTER TABLE `vegi`.`openinghours` 
DROP COLUMN `logicId`,
DROP COLUMN `timezone`;

ALTER TABLE `vegi`.`order` 
DROP COLUMN `refundDateTime`,
DROP COLUMN `deliveryAddressCity`,
DROP COLUMN `deliveryId`,
DROP COLUMN `deliveryPartnerAccepted`,
DROP COLUMN `deliveryPartnerConfirmed`,
DROP COLUMN `completedFlag`,
DROP COLUMN `completedOrderFeedback`,
DROP COLUMN `deliveryPunctuality`,
DROP COLUMN `orderCondition`,
DROP COLUMN `deliveryPartner`,
DROP COLUMN `parentOrder`;

ALTER TABLE `vegi`.`orderitem` 
DROP COLUMN `unfulfilled`,
DROP COLUMN `unfulfilledOnOrderId`;

ALTER TABLE `vegi`.`product` 
DROP COLUMN `status`;

ALTER TABLE `vegi`.`productcategory` 
DROP COLUMN `categoryGroup`;

ALTER TABLE `vegi`.`user` 
DROP COLUMN `phoneNoCountry`,
DROP COLUMN `phoneCountryCode`,
DROP COLUMN `vendorRole`,
DROP COLUMN `deliveryPartnerRole`,
DROP COLUMN `roleConfirmedWithOwner`,
DROP COLUMN `vendorConfirmed`,
DROP COLUMN `fbUid`,
DROP COLUMN `firebaseSessionToken`,
DROP COLUMN `secret`,
DROP COLUMN `deliveryPartner`;

ALTER TABLE `vegi`.`vendor` 
DROP COLUMN `pickupAddressLatitude`,
DROP COLUMN `pickupAddressLongitude`;


