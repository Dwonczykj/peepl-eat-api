-- Run this script and run the migration: safe mode
SET sql_safe_updates=0;
SET sql_safe_updates=1;

ALTER TABLE `vegi`.`deliverypartner` 
ADD COLUMN `type` VARCHAR(255) NULL DEFAULT `bike` AFTER `status`,
ADD COLUMN `description` VARCHAR(255) NULL DEFAULT `` AFTER `type`,
ADD COLUMN `walletAddress` VARCHAR(255) NULL DEFAULT `` AFTER `description`,
ADD COLUMN `imageUrl` VARCHAR(255) NULL DEFAULT `` AFTER `walletAddress`,
ADD COLUMN `rating` INT NULL DEFAULT 5 AFTER `imageUrl`,
ADD COLUMN `deliversToPostCodes` LONGTEXT NULL DEFAULT NULL AFTER `rating`,
ADD UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
ADD UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE;
;

ALTER TABLE `vegi`.`postaldistrict` 
ADD UNIQUE INDEX `outcode_UNIQUE` (`outcode` ASC) VISIBLE;
;

ALTER TABLE `vegi`.`openinghours` 
ADD COLUMN `logicId` VARCHAR(255) NULL DEFAULT `` AFTER `fulfilmentMethod`,
ADD COLUMN `timezone` INT NULL DEFAULT 0 AFTER `logicId`;

ALTER TABLE `vegi`.`order` 
ADD COLUMN `refundDateTime` DOUBLE NULL DEFAULT NULL AFTER `subtotal`,
ADD COLUMN `deliveryAddressCity` VARCHAR(255) NULL DEFAULT `` AFTER `refundDateTime`,
ADD COLUMN `deliveryId` VARCHAR(255) NULL DEFAULT `` AFTER `deliveryAddressCity`,
ADD COLUMN `deliveryPartnerAccepted` TINYINT(1) NULL DEFAULT 0 AFTER `deliveryId`,
ADD COLUMN `deliveryPartnerConfirmed` TINYINT(1) NULL DEFAULT 0 AFTER `deliveryPartnerAccepted`,
ADD COLUMN `completedFlag` VARCHAR(255) NULL DEFAULT `` AFTER `deliveryPartnerConfirmed`,
ADD COLUMN `completedOrderFeedback` VARCHAR(255) NULL DEFAULT `` AFTER `completedFlag`,
ADD COLUMN `deliveryPunctuality` INT NULL DEFAULT NULL AFTER `completedOrderFeedback`,
ADD COLUMN `orderCondition` INT NULL DEFAULT NULL AFTER `deliveryPunctuality`,
ADD COLUMN `deliveryPartner` INT NULL DEFAULT NULL AFTER `orderCondition`,
ADD COLUMN `parentOrder` INT NULL DEFAULT NULL AFTER `deliveryPartner`;

ALTER TABLE `vegi`.`orderitem` 
ADD COLUMN `unfulfilled` TINYINT(1) NULL DEFAULT 0 AFTER `id`,
ADD COLUMN `unfulfilledOnOrderId` DOUBLE NULL DEFAULT NULL AFTER `unfulfilled`;

ALTER TABLE `vegi`.`product` 
ADD COLUMN `status` VARCHAR(255) NULL DEFAULT `inactive` AFTER `isFeatured`;

ALTER TABLE `vegi`.`productcategory` 
ADD COLUMN `categoryGroup` INT NULL DEFAULT NULL AFTER `vendor`;

ALTER TABLE `vegi`.`user` 
DROP COLUMN `password`,
ADD COLUMN `phoneNoCountry` DOUBLE NULL DEFAULT 0 AFTER `email`,
ADD COLUMN `phoneCountryCode` DOUBLE NULL DEFAULT 0 AFTER `phoneNoCountry`,
ADD COLUMN `vendorRole` VARCHAR(255) NULL DEFAULT `none` AFTER `role`,
ADD COLUMN `deliveryPartnerRole` VARCHAR(255) NULL DEFAULT `none` AFTER `vendorRole`,
ADD COLUMN `roleConfirmedWithOwner` TINYINT(1) NULL DEFAULT 0 AFTER `deliveryPartnerRole`,
ADD COLUMN `vendorConfirmed` TINYINT(1) NULL DEFAULT 0 AFTER `roleConfirmedWithOwner`,
ADD COLUMN `fbUid` VARCHAR(255) NULL DEFAULT `` AFTER `vendorConfirmed`,
ADD COLUMN `firebaseSessionToken` VARCHAR(1020) NULL DEFAULT `` AFTER `fbUid`,
ADD COLUMN `secret` VARCHAR(255) NULL DEFAULT `` AFTER `firebaseSessionToken`,
ADD COLUMN `deliveryPartner` INT NULL DEFAULT NULL AFTER `vendor`;
;

ALTER TABLE `vegi`.`vendor` 
ADD COLUMN `pickupAddressLatitude` DOUBLE NULL DEFAULT NULL AFTER `pickupAddressPostCode`,
ADD COLUMN `pickupAddressLongitude` DOUBLE NULL DEFAULT NULL AFTER `pickupAddressLatitude`;


