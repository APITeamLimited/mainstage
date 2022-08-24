-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BlogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "estimatedReadingMinutes" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "previewImageSrc" TEXT,
    CONSTRAINT "BlogEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagsOnArticles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "tagId" TEXT NOT NULL,
    "blogEntryId" TEXT NOT NULL,
    CONSTRAINT "TagsOnArticles_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TagsOnArticles_blogEntryId_fkey" FOREIGN KEY ("blogEntryId") REFERENCES "BlogEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
