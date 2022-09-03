/*
  Warnings:

  - Added the required column `slug` to the `Scope` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scope" ADD COLUMN     "slug" TEXT NOT NULL;
