/*
  Warnings:

  - You are about to drop the column `testSchedulingEnabled` on the `PlanInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlanInfo" DROP COLUMN "testSchedulingEnabled",
ADD COLUMN     "maxConcurrentScheduledTests" INTEGER NOT NULL DEFAULT 0;
