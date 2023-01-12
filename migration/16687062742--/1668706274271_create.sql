USE vegi;

CREATE TABLE `address` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT '',
  `addressLineOne` varchar(255) DEFAULT '',
  `addressLineTwo` varchar(255) DEFAULT '',
  `addressTownCity` varchar(255) DEFAULT '',
  `addressPostCode` varchar(255) DEFAULT '',
  `addressCountryCode` varchar(255) DEFAULT 'UK',
  `latitude` DOUBLE DEFAULT NULL,
  `longitude` DOUBLE DEFAULT NULL,
  `vendor` INT DEFAULT NULL,
  `deliveryPartner` INT DEFAULT NULL,
  `user` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `survey` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT '',
  `question` varchar(255) DEFAULT '',
  `answer` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `waitinglist` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT '',
  `userType` varchar(50) DEFAULT '',
  `origin` varchar(50) DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `like` (
  `createdAt` bigint DEFAULT NULL,
  `updatedAt` bigint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `headers` LONGTEXT,
  `guid` varchar(255) DEFAULT '' 
  COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
