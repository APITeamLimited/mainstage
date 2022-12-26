-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "maxConcurrentTests" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "PlanInfo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "priceMonthlyCents" DOUBLE PRECISION NOT NULL,
    "priceYearlyCents" DOUBLE PRECISION NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "maxConcurrentTests" INTEGER NOT NULL,
    "monthlyCredits" INTEGER NOT NULL,
    "loadZones" TEXT[],

    CONSTRAINT "PlanInfo_pkey" PRIMARY KEY ("id")
);
