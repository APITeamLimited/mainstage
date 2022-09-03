/*
  Warnings:

  - You are about to drop the column `name` on the `Team` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Team_name_key";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "name";
