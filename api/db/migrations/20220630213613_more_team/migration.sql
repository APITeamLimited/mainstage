-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "shortBio" TEXT,
    "profilePicture" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10
);
INSERT INTO "new_Team" ("createdAt", "id", "name", "profilePicture", "shortBio", "updatedAt") SELECT "createdAt", "id", "name", "profilePicture", "shortBio", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
