/*
  Warnings:

  - You are about to drop the column `profilePicture` on the `Team` table. All the data in the column will be lost.
  - Added the required column `name` to the `CreditsPricingOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verboseName` to the `CreditsPricingOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditsPricingOption" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "verboseName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "profilePicture";
