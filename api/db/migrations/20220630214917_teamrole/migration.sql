/*
  Warnings:

  - Added the required column `role` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamMembership" ("createdAt", "id", "teamId", "updatedAt", "userId") SELECT "createdAt", "id", "teamId", "updatedAt", "userId" FROM "TeamMembership";
DROP TABLE "TeamMembership";
ALTER TABLE "new_TeamMembership" RENAME TO "TeamMembership";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
