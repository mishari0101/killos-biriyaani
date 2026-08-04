-- CreateTable
CREATE TABLE `MenuCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MenuCategory_slug_key`(`slug`),
    INDEX `MenuCategory_displayOrder_idx`(`displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed the initial categories so the menu manager dropdown is populated and
-- matches the categories already used by existing menu items.
INSERT INTO `MenuCategory` (`name`, `slug`, `displayOrder`, `createdAt`, `updatedAt`) VALUES
    ('Biriyani', 'biriyani', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('BBQ', 'bbq', 2, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Parotta', 'parotta', 3, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Kothu', 'kothu', 4, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Fried Rice', 'fried-rice', 5, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Short Eats', 'short-eats', 6, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
    ('Hot Drinks', 'hot-drinks', 7, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));
