SET @column_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'carriages'
    AND COLUMN_NAME = 'active_carriage_number'
);
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `carriages` ADD COLUMN `active_carriage_number` INT GENERATED ALWAYS AS (CASE WHEN `deleted_at` IS NULL THEN `carriage_number` ELSE NULL END) STORED',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'carriages'
    AND INDEX_NAME = 'carriages_active_train_carriage_number_key'
);
SET @sql = IF(
  @index_exists = 0,
  'CREATE UNIQUE INDEX `carriages_active_train_carriage_number_key` ON `carriages` (`train_id`, `active_carriage_number`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'seats'
    AND COLUMN_NAME = 'active_seat_number'
);
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `seats` ADD COLUMN `active_seat_number` VARCHAR(20) GENERATED ALWAYS AS (CASE WHEN `deleted_at` IS NULL THEN `seat_number` ELSE NULL END) STORED',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'seats'
    AND INDEX_NAME = 'seats_active_carriage_seat_number_key'
);
SET @sql = IF(
  @index_exists = 0,
  'CREATE UNIQUE INDEX `seats_active_carriage_seat_number_key` ON `seats` (`carriage_id`, `active_seat_number`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
