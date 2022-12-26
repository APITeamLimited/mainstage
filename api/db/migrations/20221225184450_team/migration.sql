/*
  Warnings:

  - You are about to drop the column `maxConcurrentTests` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `maxMembers` on the `Team` table. All the data in the column will be lost.
  - Added the required column `priceId` to the `CreditsPricingOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeProductId` to the `CreditsPricingOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditsPricingOption" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceId" TEXT NOT NULL,
ADD COLUMN     "stripeProductId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "maxConcurrentTests",
DROP COLUMN "maxMembers",
ADD COLUMN     "planInfoId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "planInfoId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planInfoId_fkey" FOREIGN KEY ("planInfoId") REFERENCES "PlanInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_planInfoId_fkey" FOREIGN KEY ("planInfoId") REFERENCES "PlanInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
