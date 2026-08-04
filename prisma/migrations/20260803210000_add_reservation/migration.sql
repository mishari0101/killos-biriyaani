-- CreateTable
CREATE TABLE `Reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `email` VARCHAR(160) NOT NULL DEFAULT '',
    `branch` VARCHAR(160) NOT NULL DEFAULT '',
    `guests` INTEGER NOT NULL,
    `date` VARCHAR(10) NOT NULL,
    `time` VARCHAR(5) NOT NULL,
    `occasion` VARCHAR(80) NOT NULL DEFAULT '',
    `request` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NOT NULL,
    `confirmedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Reservation_number_key`(`number`),
    INDEX `Reservation_status_idx`(`status`),
    INDEX `Reservation_date_idx`(`date`),
    INDEX `Reservation_phone_idx`(`phone`),
    INDEX `Reservation_branch_idx`(`branch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
