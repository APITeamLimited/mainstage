/*
  Warnings:

  - Added the required column `variant` to the `VerifiedDomain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantTargetId` to the `VerifiedDomain` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VerifiedDomain" DROP CONSTRAINT "VerifiedDomain_teamId_fkey";

-- DropForeignKey
ALTER TABLE "VerifiedDomain" DROP CONSTRAINT "VerifiedDomain_userId_fkey";

-- AlterTable
ALTER TABLE "VerifiedDomain" ADD COLUMN     "variant" TEXT NOT NULL,
ADD COLUMN     "variantTargetId" TEXT NOT NULL,
ALTER COLUMN "teamId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VerifiedDomain" ADD CONSTRAINT "VerifiedDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedDomain" ADD CONSTRAINT "VerifiedDomain_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
