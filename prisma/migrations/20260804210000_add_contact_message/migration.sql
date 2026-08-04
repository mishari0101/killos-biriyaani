-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `email` VARCHAR(160) NOT NULL DEFAULT '',
    `subject` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `branch` VARCHAR(160) NOT NULL DEFAULT '',
    `status` VARCHAR(20) NOT NULL DEFAULT 'NEW',
    `notes` TEXT NOT NULL,
    `repliedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContactMessage_number_key`(`number`),
    INDEX `ContactMessage_status_idx`(`status`),
    INDEX `ContactMessage_createdAt_idx`(`createdAt`),
    INDEX `ContactMessage_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
