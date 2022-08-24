/*
  Warnings:

  - You are about to drop the column `isSupport` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "shortBio" TEXT,
    "profilePicture" TEXT,
    "hashedPassword" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpiresAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "firstName", "hashedPassword", "id", "lastName", "profilePicture", "resetToken", "resetTokenExpiresAt", "salt", "shortBio", "updatedAt") SELECT "createdAt", "email", "emailVerified", "firstName", "hashedPassword", "id", "lastName", "profilePicture", "resetToken", "resetTokenExpiresAt", "salt", "shortBio", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
