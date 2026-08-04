-- CreateTable
CREATE TABLE `GalleryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(160) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL DEFAULT '',
    `aspect` VARCHAR(24) NOT NULL DEFAULT '4 / 3',
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GalleryItem_displayOrder_idx`(`displayOrder`),
    INDEX `GalleryItem_featured_idx`(`featured`),
    INDEX `GalleryItem_visible_idx`(`visible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
