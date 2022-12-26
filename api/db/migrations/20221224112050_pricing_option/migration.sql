/*
  Warnings:

  - You are about to drop the column `amount` on the `CreditsPricingOption` table. All the data in the column will be lost.
  - Added the required column `credits` to the `CreditsPricingOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditsPricingOption" DROP COLUMN "amount",
ADD COLUMN     "credits" INTEGER NOT NULL;
