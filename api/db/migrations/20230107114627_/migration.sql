-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "pastDue" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pastDue" BOOLEAN NOT NULL DEFAULT false;
