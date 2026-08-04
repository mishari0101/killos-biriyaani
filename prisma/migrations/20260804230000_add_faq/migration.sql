-- CreateTable
CREATE TABLE `Faq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(300) NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(80) NOT NULL DEFAULT '',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Faq_displayOrder_idx`(`displayOrder`),
    INDEX `Faq_featured_idx`(`featured`),
    INDEX `Faq_visible_idx`(`visible`),
    INDEX `Faq_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
