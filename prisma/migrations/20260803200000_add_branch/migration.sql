-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL DEFAULT '',
    `address` VARCHAR(500) NOT NULL,
    `mapsUrl` VARCHAR(1000) NOT NULL DEFAULT '',
    `latitude` DOUBLE NOT NULL DEFAULT 0,
    `longitude` DOUBLE NOT NULL DEFAULT 0,
    `primaryPhone` VARCHAR(40) NOT NULL,
    `secondaryPhone` VARCHAR(40) NOT NULL DEFAULT '',
    `whatsapp` VARCHAR(40) NOT NULL DEFAULT '',
    `email` VARCHAR(160) NOT NULL DEFAULT '',
    `hours` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Branch_slug_key`(`slug`),
    INDEX `Branch_displayOrder_idx`(`displayOrder`),
    INDEX `Branch_featured_idx`(`featured`),
    INDEX `Branch_visible_idx`(`visible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
