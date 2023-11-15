-- CreateTable
CREATE TABLE `User` (
    `userId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flashcards` (
    `title` VARCHAR(191) NOT NULL,
    `flashcard_id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `status` ENUM('FULLY_UNDERSTOOD', 'WORKING', 'NOT_SEEN') NOT NULL,
    `colorCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `rating` ENUM('VERY_BAD', 'BAD', 'NEUTRAL', 'GOOD', 'VERY_GOOD') NOT NULL DEFAULT 'NEUTRAL',

    UNIQUE INDEX `Flashcards_topicId_key`(`topicId`),
    PRIMARY KEY (`flashcard_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `topicId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`topicId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
