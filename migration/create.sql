CREATE TABLE `notification` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `sentAt` double DEFAULT NULL,
  `publicId` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `metadata` longtext,
  `order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
