/*
  Warnings:

  - You are about to drop the column `freeTokensCreditedAt` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `freeTokensCreditedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "freeTokensCreditedAt",
ADD COLUMN     "freeCreditsAddedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "freeTokensCreditedAt",
ADD COLUMN     "freeCreditsAddedAt" TIMESTAMP(3);
