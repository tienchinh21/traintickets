ALTER TABLE `seat_types`
  ADD COLUMN `allowed_carriage_types` JSON NULL AFTER `base_multiplier`;

UPDATE `seat_types`
SET `allowed_carriage_types` = CASE
  WHEN `code` IN ('HARD_SEAT', 'SOFT_SEAT') THEN JSON_ARRAY('SEAT')
  WHEN `code` LIKE 'SLEEPER%' THEN JSON_ARRAY('SLEEPER', 'VIP')
  ELSE JSON_ARRAY('SEAT', 'SLEEPER', 'VIP')
END
WHERE `allowed_carriage_types` IS NULL;

ALTER TABLE `seat_types`
  MODIFY `allowed_carriage_types` JSON NOT NULL;

ALTER TABLE `carriages`
  MODIFY `carriage_type` ENUM('SEAT', 'SLEEPER', 'VIP') NOT NULL;
