-- AlterTable
ALTER TABLE "PlanInfo" ADD COLUMN     "freeTrialDays" INTEGER;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerId" TEXT;
