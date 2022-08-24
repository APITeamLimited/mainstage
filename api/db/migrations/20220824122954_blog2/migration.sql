/*
  Warnings:

  - You are about to drop the `BlogEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogEntry";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "estimatedReadingMinutes" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "previewImageSrc" TEXT,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TagsOnArticles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "tagId" TEXT NOT NULL,
    "blogEntryId" TEXT NOT NULL,
    CONSTRAINT "TagsOnArticles_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagsOnArticles_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TagsOnArticles" ("blogEntryId", "createdAt", "id", "tagId", "updatedAt") SELECT "blogEntryId", "createdAt", "id", "tagId", "updatedAt" FROM "TagsOnArticles";
DROP TABLE "TagsOnArticles";
ALTER TABLE "new_TagsOnArticles" RENAME TO "TagsOnArticles";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
