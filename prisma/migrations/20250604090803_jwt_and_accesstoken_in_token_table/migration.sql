/*
  Warnings:

  - You are about to drop the column `token` on the `token` table. All the data in the column will be lost.
  - Added the required column `accessToken` to the `token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jwt` to the `token` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "jwt" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    CONSTRAINT "token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("stravaId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_token" ("id", "userId") SELECT "id", "userId" FROM "token";
DROP TABLE "token";
ALTER TABLE "new_token" RENAME TO "token";
CREATE UNIQUE INDEX "token_userId_key" ON "token"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
