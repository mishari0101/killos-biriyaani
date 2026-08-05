-- AlterTable
ALTER TABLE `restaurantsettings` ADD COLUMN `adminEmail` VARCHAR(160) NOT NULL DEFAULT '',
    ADD COLUMN `adminName` VARCHAR(120) NOT NULL DEFAULT '',
    ADD COLUMN `adminPasswordHash` VARCHAR(512) NOT NULL DEFAULT '',
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL;
