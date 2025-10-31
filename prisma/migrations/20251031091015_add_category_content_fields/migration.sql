-- AlterTable
ALTER TABLE `categories` ADD COLUMN `intro` LONGTEXT NULL,
    ADD COLUMN `sections` LONGTEXT NULL,
    ADD COLUMN `seoDescription` TEXT NULL,
    ADD COLUMN `seoTitle` VARCHAR(191) NULL,
    ADD COLUMN `uiConfig` TEXT NULL;
