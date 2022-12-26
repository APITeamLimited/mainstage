/*
  Warnings:

  - You are about to drop the column `stripeProductId` on the `CreditsPricingOption` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `PlanInfo` table. All the data in the column will be lost.
  - Added the required column `productId` to the `CreditsPricingOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `PlanInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditsPricingOption" DROP COLUMN "stripeProductId",
ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlanInfo" DROP COLUMN "stripeProductId",
ADD COLUMN     "productId" TEXT NOT NULL;
