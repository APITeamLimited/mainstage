/*
  Warnings:

  - You are about to drop the column `maxConcurrentTests` on the `PlanInfo` table. All the data in the column will be lost.
  - You are about to alter the column `priceMonthlyCents` on the `PlanInfo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `priceYearlyCents` on the `PlanInfo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `maxConcurrentCloudTests` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxTestDurationMinutes` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testDataRetentionDays` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testSchedulingEnabled` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanInfo" DROP COLUMN "maxConcurrentTests",
ADD COLUMN     "maxConcurrentCloudTests" INTEGER NOT NULL,
ADD COLUMN     "maxTestDurationMinutes" INTEGER NOT NULL,
ADD COLUMN     "testDataRetentionDays" INTEGER NOT NULL,
ADD COLUMN     "testSchedulingEnabled" BOOLEAN NOT NULL,
ALTER COLUMN "priceMonthlyCents" SET DATA TYPE INTEGER,
ALTER COLUMN "priceYearlyCents" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "CreditsPricingOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "amount" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,

    CONSTRAINT "CreditsPricingOption_pkey" PRIMARY KEY ("id")
);
