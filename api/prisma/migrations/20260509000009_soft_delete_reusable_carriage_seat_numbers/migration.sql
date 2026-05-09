SET @index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'carriages'
    AND INDEX_NAME = 'carriages_train_id_carriage_number_idx'
);
SET @sql = IF(
  @index_exists = 0,
  'CREATE INDEX `carriages_train_id_carriage_number_idx` ON `carriages` (`train_id`, `carriage_number`)',
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
    AND INDEX_NAME = 'carriages_train_id_carriage_number_key'
);
SET @sql = IF(
  @index_exists > 0,
  'ALTER TABLE `carriages` DROP INDEX `carriages_train_id_carriage_number_key`',
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
    AND INDEX_NAME = 'seats_carriage_id_seat_number_idx'
);
SET @sql = IF(
  @index_exists = 0,
  'CREATE INDEX `seats_carriage_id_seat_number_idx` ON `seats` (`carriage_id`, `seat_number`)',
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
    AND INDEX_NAME = 'seats_carriage_id_seat_number_key'
);
SET @sql = IF(
  @index_exists > 0,
  'ALTER TABLE `seats` DROP INDEX `seats_carriage_id_seat_number_key`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
