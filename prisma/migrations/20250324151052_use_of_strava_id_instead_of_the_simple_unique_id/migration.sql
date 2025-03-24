/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivitiesOnUsers" (
    "userId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "activityId"),
    CONSTRAINT "ActivitiesOnUsers_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivitiesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("stravaId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActivitiesOnUsers" ("activityId", "userId") SELECT "activityId", "userId" FROM "ActivitiesOnUsers";
DROP TABLE "ActivitiesOnUsers";
ALTER TABLE "new_ActivitiesOnUsers" RENAME TO "ActivitiesOnUsers";
CREATE TABLE "new_User" (
    "stravaId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "teamId" INTEGER,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "firstName", "lastName", "password", "stravaId", "teamId") SELECT "email", "firstName", "lastName", "password", "stravaId", "teamId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_stravaId_key" ON "User"("stravaId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
