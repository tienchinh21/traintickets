CREATE TABLE `routes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(1000) NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `routes_code_key` (`code`),
  KEY `routes_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `route_stops` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id` BIGINT UNSIGNED NOT NULL,
  `station_id` BIGINT UNSIGNED NOT NULL,
  `stop_order` INT UNSIGNED NOT NULL,
  `distance_from_start_km` DECIMAL(8, 2) NOT NULL,
  `default_arrival_offset_minutes` INT UNSIGNED NULL,
  `default_departure_offset_minutes` INT UNSIGNED NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `route_stops_route_id_stop_order_key` (`route_id`, `stop_order`),
  UNIQUE KEY `route_stops_route_id_station_id_key` (`route_id`, `station_id`),
  KEY `route_stops_station_id_idx` (`station_id`),
  CONSTRAINT `route_stops_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `route_stops_station_id_fkey` FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
