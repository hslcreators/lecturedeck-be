/*
  Warnings:

  - Added the required column `flashcard_url` to the `Flashcards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Flashcards` ADD COLUMN `flashcard_url` VARCHAR(191) NOT NULL;
