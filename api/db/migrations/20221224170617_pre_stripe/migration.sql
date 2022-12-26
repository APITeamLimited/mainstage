/*
  Warnings:

  - You are about to drop the column `testDataRetentionDays` on the `PlanInfo` table. All the data in the column will be lost.
  - Added the required column `dataRetentionMonths` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxSimulatedUsers` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyPriceId` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeProductId` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verboseName` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearlyPriceId` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanInfo" DROP COLUMN "testDataRetentionDays",
ADD COLUMN     "dataRetentionMonths" INTEGER NOT NULL,
ADD COLUMN     "maxSimulatedUsers" INTEGER NOT NULL,
ADD COLUMN     "monthlyPriceId" TEXT NOT NULL,
ADD COLUMN     "stripeProductId" TEXT NOT NULL,
ADD COLUMN     "verboseName" TEXT NOT NULL,
ADD COLUMN     "yearlyPriceId" TEXT NOT NULL;
