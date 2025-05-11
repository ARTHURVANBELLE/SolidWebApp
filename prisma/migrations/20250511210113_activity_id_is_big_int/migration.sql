/*
  Warnings:

  - The primary key for the `ActivitiesOnUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `activityId` on the `ActivitiesOnUsers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `id` on the `Activity` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `activityId` on the `Comment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `activityId` on the `imageUrl` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivitiesOnUsers" (
    "userId" INTEGER NOT NULL,
    "activityId" BIGINT NOT NULL,

    PRIMARY KEY ("userId", "activityId"),
    CONSTRAINT "ActivitiesOnUsers_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivitiesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("stravaId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActivitiesOnUsers" ("activityId", "userId") SELECT "activityId", "userId" FROM "ActivitiesOnUsers";
DROP TABLE "ActivitiesOnUsers";
ALTER TABLE "new_ActivitiesOnUsers" RENAME TO "ActivitiesOnUsers";
CREATE TABLE "new_Activity" (
    "id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "datetime" TEXT NOT NULL,
    "description" TEXT,
    "gpxUrl" TEXT
);
INSERT INTO "new_Activity" ("datetime", "description", "gpxUrl", "id", "title") SELECT "datetime", "description", "gpxUrl", "id", "title" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE UNIQUE INDEX "Activity_id_key" ON "Activity"("id");
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "activityId" BIGINT NOT NULL,
    CONSTRAINT "Comment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("activityId", "id", "text") SELECT "activityId", "id", "text" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_imageUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "activityId" BIGINT NOT NULL,
    CONSTRAINT "imageUrl_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_imageUrl" ("activityId", "id", "url") SELECT "activityId", "id", "url" FROM "imageUrl";
DROP TABLE "imageUrl";
ALTER TABLE "new_imageUrl" RENAME TO "imageUrl";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
