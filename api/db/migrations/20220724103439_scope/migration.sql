-- CreateTable
CREATE TABLE "Scope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variant" TEXT NOT NULL,
    "variantTargetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "userId" TEXT NOT NULL
);
