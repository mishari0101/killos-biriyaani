-- CreateTable
CREATE TABLE `SiteSEO` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `siteTitle` VARCHAR(200) NOT NULL DEFAULT '',
    `metaTitle` VARCHAR(200) NOT NULL DEFAULT '',
    `metaDescription` VARCHAR(400) NOT NULL DEFAULT '',
    `keywords` VARCHAR(400) NOT NULL DEFAULT '',
    `canonicalUrl` VARCHAR(500) NOT NULL DEFAULT '',
    `ogTitle` VARCHAR(200) NOT NULL DEFAULT '',
    `ogDescription` VARCHAR(400) NOT NULL DEFAULT '',
    `ogImage` VARCHAR(500) NOT NULL DEFAULT '',
    `twitterTitle` VARCHAR(200) NOT NULL DEFAULT '',
    `twitterDescription` VARCHAR(400) NOT NULL DEFAULT '',
    `twitterImage` VARCHAR(500) NOT NULL DEFAULT '',
    `googleAnalyticsId` VARCHAR(40) NOT NULL DEFAULT '',
    `googleTagManagerId` VARCHAR(40) NOT NULL DEFAULT '',
    `googleSiteVerification` VARCHAR(200) NOT NULL DEFAULT '',
    `facebookDomainVerification` VARCHAR(200) NOT NULL DEFAULT '',
    `robotsIndex` BOOLEAN NOT NULL DEFAULT true,
    `robotsFollow` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
