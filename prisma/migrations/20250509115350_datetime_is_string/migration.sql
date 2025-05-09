-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "datetime" TEXT NOT NULL,
    "description" TEXT,
    "gpxUrl" TEXT
);
INSERT INTO "new_Activity" ("datetime", "description", "gpxUrl", "id", "title") SELECT "datetime", "description", "gpxUrl", "id", "title" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE UNIQUE INDEX "Activity_id_key" ON "Activity"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
