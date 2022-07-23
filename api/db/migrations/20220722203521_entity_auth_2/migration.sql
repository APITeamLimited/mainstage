/*
  Warnings:

  - You are about to drop the `BearerKeyPair` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BearerKeyPair";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EntityAuthKeyPair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL
);
