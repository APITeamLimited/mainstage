/*
  Warnings:

  - You are about to drop the column `teamId` on the `VerifiedDomain` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `VerifiedDomain` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerifiedDomain" DROP CONSTRAINT "VerifiedDomain_teamId_fkey";

-- DropForeignKey
ALTER TABLE "VerifiedDomain" DROP CONSTRAINT "VerifiedDomain_userId_fkey";

-- AlterTable
ALTER TABLE "VerifiedDomain" DROP COLUMN "teamId",
DROP COLUMN "userId";
