-- CreateTable
CREATE TABLE `Attraction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL DEFAULT '',
    `mapUrl` VARCHAR(1000) NOT NULL DEFAULT '',
    `rating` DECIMAL(2, 1) NOT NULL DEFAULT 0,
    `travelTime` VARCHAR(80) NOT NULL DEFAULT '',
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Attraction_slug_key`(`slug`),
    INDEX `Attraction_displayOrder_idx`(`displayOrder`),
    INDEX `Attraction_featured_idx`(`featured`),
    INDEX `Attraction_visible_idx`(`visible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
