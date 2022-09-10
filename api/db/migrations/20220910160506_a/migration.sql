/*
  Warnings:

  - You are about to drop the column `markedForDeletionExpiresAt` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `markedForDeletionToken` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "markedForDeletionExpiresAt",
DROP COLUMN "markedForDeletionToken";
