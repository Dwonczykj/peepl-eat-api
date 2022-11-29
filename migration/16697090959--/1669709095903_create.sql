USE vegi;

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
