/*
  Warnings:

  - You are about to drop the column `markedForDeletion` on the `Team` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "shortBio" TEXT,
    "profilePicture" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "markedForDeletionToken" TEXT,
    "markedForDeletionExpiresAt" DATETIME
);
INSERT INTO "new_Team" ("createdAt", "id", "markedForDeletionExpiresAt", "maxMembers", "name", "profilePicture", "shortBio", "updatedAt") SELECT "createdAt", "id", "markedForDeletionExpiresAt", "maxMembers", "name", "profilePicture", "shortBio", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
