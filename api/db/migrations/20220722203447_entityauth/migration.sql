-- CreateTable
CREATE TABLE "BearerKeyPair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL
);
