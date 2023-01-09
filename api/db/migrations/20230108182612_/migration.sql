-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_planInfoId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_planInfoId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planInfoId_fkey" FOREIGN KEY ("planInfoId") REFERENCES "PlanInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_planInfoId_fkey" FOREIGN KEY ("planInfoId") REFERENCES "PlanInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
