/*
  Warnings:

  - Added the required column `datetime` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "imageUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "activityId" INTEGER NOT NULL,
    CONSTRAINT "imageUrl_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "datetime" DATETIME NOT NULL,
    "description" TEXT,
    "gpxUrl" TEXT
);
INSERT INTO "new_Activity" ("id", "title") SELECT "id", "title" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
