-- CreateTable
CREATE TABLE `BlogPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `coverImage` VARCHAR(500) NOT NULL DEFAULT '',
    `category` VARCHAR(80) NOT NULL DEFAULT '',
    `tags` VARCHAR(400) NOT NULL DEFAULT '',
    `author` VARCHAR(120) NOT NULL DEFAULT '',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `seoTitle` VARCHAR(200) NOT NULL DEFAULT '',
    `seoDescription` VARCHAR(400) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key` (`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Indexes
CREATE INDEX `BlogPost_displayOrder_idx` ON `BlogPost`(`displayOrder`);
CREATE INDEX `BlogPost_featured_idx` ON `BlogPost`(`featured`);
CREATE INDEX `BlogPost_published_idx` ON `BlogPost`(`published`);
CREATE INDEX `BlogPost_publishedAt_idx` ON `BlogPost`(`publishedAt`);
CREATE INDEX `BlogPost_category_idx` ON `BlogPost`(`category`);
