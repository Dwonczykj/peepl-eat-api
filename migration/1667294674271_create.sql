USE vegitemp;

CREATE TABLE `categorygroup` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `forRestaurantItem` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `sentAt` double DEFAULT NULL,
  `publicId` varchar(255) DEFAULT NULL,
  `title` longtext DEFAULT '',
  `metadata` longtext,
  `order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refund` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `paymentIntentId` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `requestedAt` double DEFAULT NULL,
  `refundStatus` varchar(255) DEFAULT NULL,
  `recipientWalletAddress` varchar(255) DEFAULT NULL,
  `order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
