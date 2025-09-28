/*
  Warnings:

  - You are about to drop the column `messageContent` on the `promotion` table. All the data in the column will be lost.
  - You are about to drop the column `messageTitle` on the `promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `promotion` DROP COLUMN `messageContent`,
    DROP COLUMN `messageTitle`;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `messageTitle` VARCHAR(191) NOT NULL,
    `messageContent` VARCHAR(191) NOT NULL,
    `promotionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Message_promotionId_key`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
