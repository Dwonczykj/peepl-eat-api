-- Run this script and run the migration: safe mode

ALTER TABLE `vegitemp`.`deliverypartner` 
ADD COLUMN `type` VARCHAR(255) NULL DEFAULT NULL AFTER `status`,
ADD COLUMN `description` VARCHAR(255) NULL DEFAULT NULL AFTER `type`,
ADD COLUMN `walletAddress` VARCHAR(255) NULL DEFAULT NULL AFTER `description`,
ADD COLUMN `imageUrl` VARCHAR(255) NULL DEFAULT NULL AFTER `walletAddress`,
ADD COLUMN `rating` INT NULL DEFAULT 5 AFTER `imageUrl`,
ADD COLUMN `deliversToPostCodes` LONGTEXT NULL DEFAULT NULL AFTER `rating`,
ADD UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
ADD UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE;
;

ALTER TABLE `vegitemp`.`postaldistrict` 
ADD UNIQUE INDEX `outcode_UNIQUE` (`outcode` ASC) VISIBLE;
;

ALTER TABLE `vegitemp`.`openinghours` 
ADD COLUMN `logicId` VARCHAR(255) NULL DEFAULT NULL AFTER `fulfilmentMethod`,
ADD COLUMN `timezone` INT NULL DEFAULT 0 AFTER `logicId`;

ALTER TABLE `vegitemp`.`order` 
ADD COLUMN `refundDateTime` DOUBLE NULL DEFAULT NULL AFTER `subtotal`,
ADD COLUMN `deliveryAddressCity` VARCHAR(255) NULL DEFAULT NULL AFTER `refundDateTime`,
ADD COLUMN `deliveryId` VARCHAR(255) NULL DEFAULT NULL AFTER `deliveryAddressCity`,
ADD COLUMN `deliveryPartnerAccepted` TINYINT(1) NULL DEFAULT NULL AFTER `deliveryId`,
ADD COLUMN `deliveryPartnerConfirmed` TINYINT(1) NULL DEFAULT NULL AFTER `deliveryPartnerAccepted`,
ADD COLUMN `completedFlag` VARCHAR(255) NULL DEFAULT NULL AFTER `deliveryPartnerConfirmed`,
ADD COLUMN `completedOrderFeedback` VARCHAR(255) NULL DEFAULT NULL AFTER `completedFlag`,
ADD COLUMN `deliveryPunctuality` INT NULL DEFAULT NULL AFTER `completedOrderFeedback`,
ADD COLUMN `orderCondition` INT NULL DEFAULT NULL AFTER `deliveryPunctuality`,
ADD COLUMN `deliveryPartner` INT NULL DEFAULT NULL AFTER `orderCondition`,
ADD COLUMN `parentOrder` INT NULL DEFAULT NULL AFTER `deliveryPartner`;

ALTER TABLE `vegitemp`.`orderitem` 
ADD COLUMN `unfulfilled` TINYINT(1) NULL DEFAULT NULL AFTER `id`,
ADD COLUMN `unfulfilledOnOrderId` DOUBLE NULL DEFAULT NULL AFTER `unfulfilled`;

ALTER TABLE `vegitemp`.`product` 
ADD COLUMN `status` VARCHAR(255) NULL DEFAULT NULL AFTER `isFeatured`;

ALTER TABLE `vegitemp`.`productcategory` 
ADD COLUMN `categoryGroup` INT NULL DEFAULT NULL AFTER `vendor`;

ALTER TABLE `vegitemp`.`user` 
ADD COLUMN `phoneNoCountry` DOUBLE NULL DEFAULT 0 AFTER `email`,
ADD COLUMN `phoneCountryCode` DOUBLE NULL DEFAULT 0 AFTER `phoneNoCountry`,
ADD COLUMN `vendorRole` VARCHAR(255) NULL DEFAULT NULL AFTER `role`,
ADD COLUMN `deliveryPartnerRole` VARCHAR(255) NULL DEFAULT '' AFTER `vendorRole`,
ADD COLUMN `roleConfirmedWithOwner` TINYINT(1) NULL DEFAULT 0 AFTER `deliveryPartnerRole`,
ADD COLUMN `vendorConfirmed` TINYINT(1) NULL DEFAULT NULL AFTER `roleConfirmedWithOwner`,
ADD COLUMN `fbUid` VARCHAR(255) NULL DEFAULT NULL AFTER `vendorConfirmed`,
ADD COLUMN `firebaseSessionToken` VARCHAR(1020) NULL DEFAULT NULL AFTER `fbUid`,
ADD COLUMN `secret` VARCHAR(255) NULL DEFAULT NULL AFTER `firebaseSessionToken`,
ADD COLUMN `deliveryPartner` INT NULL DEFAULT NULL AFTER `vendor`;
;

ALTER TABLE `vegitemp`.`vendor` 
ADD COLUMN `pickupAddressLatitude` DOUBLE NULL DEFAULT NULL AFTER `pickupAddressPostCode`,
ADD COLUMN `pickupAddressLongitude` DOUBLE NULL DEFAULT NULL AFTER `pickupAddressLatitude`;


