/*
  Warnings:

  - You are about to drop the column `status` on the `flashcards` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `flashcards` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Flashcards_topicId_key` ON `flashcards`;

-- AlterTable
ALTER TABLE `flashcards` DROP COLUMN `status`,
    DROP COLUMN `title`;

-- AlterTable
ALTER TABLE `topic` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fileUrl` VARCHAR(191) NULL,
    ADD COLUMN `shareCode` VARCHAR(191) NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CopyLogger` (
    `copyLoggerId` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `CopyLogger_topicId_idx`(`topicId`),
    INDEX `CopyLogger_userId_idx`(`userId`),
    PRIMARY KEY (`copyLoggerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Flashcards_topicId_idx` ON `Flashcards`(`topicId`);

-- CreateIndex
CREATE INDEX `Topic_userId_idx` ON `Topic`(`userId`);
