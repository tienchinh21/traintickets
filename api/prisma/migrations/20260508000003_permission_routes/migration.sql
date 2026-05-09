ALTER TABLE `permissions`
  ADD COLUMN `method` VARCHAR(10) NULL,
  ADD COLUMN `path` VARCHAR(255) NULL;

CREATE INDEX `permissions_method_path_idx` ON `permissions` (`method`, `path`);
