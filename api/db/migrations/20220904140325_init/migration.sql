/*
  Warnings:

  - A unique constraint covering the columns `[email,teamId]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailMarketing" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_teamId_key" ON "Invitation"("email", "teamId");
