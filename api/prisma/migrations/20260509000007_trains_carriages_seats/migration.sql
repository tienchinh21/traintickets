CREATE TABLE `trains` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `status` ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trains_code_key` (`code`),
  KEY `trains_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seat_types` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NULL,
  `base_multiplier` DECIMAL(5, 2) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seat_types_code_key` (`code`),
  KEY `seat_types_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `carriages` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `train_id` CHAR(36) NOT NULL,
  `carriage_number` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `carriage_type` VARCHAR(50) NOT NULL,
  `seat_map_layout` JSON NULL,
  `status` ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carriages_train_id_carriage_number_key` (`train_id`, `carriage_number`),
  KEY `carriages_train_id_idx` (`train_id`),
  KEY `carriages_status_idx` (`status`),
  CONSTRAINT `carriages_train_id_fkey` FOREIGN KEY (`train_id`) REFERENCES `trains`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `seats` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `carriage_id` CHAR(36) NOT NULL,
  `seat_type_id` CHAR(36) NOT NULL,
  `seat_number` VARCHAR(20) NOT NULL,
  `row_number` INT UNSIGNED NULL,
  `column_number` INT UNSIGNED NULL,
  `floor_number` INT UNSIGNED NULL,
  `status` ENUM('ACTIVE', 'BROKEN', 'INACTIVE') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seats_carriage_id_seat_number_key` (`carriage_id`, `seat_number`),
  KEY `seats_seat_type_id_idx` (`seat_type_id`),
  KEY `seats_status_idx` (`status`),
  CONSTRAINT `seats_carriage_id_fkey` FOREIGN KEY (`carriage_id`) REFERENCES `carriages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `seats_seat_type_id_fkey` FOREIGN KEY (`seat_type_id`) REFERENCES `seat_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
