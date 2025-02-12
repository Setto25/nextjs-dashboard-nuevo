/*
  Warnings:

  - Made the column `rut` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido1" TEXT NOT NULL,
    "apellido2" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("apellido1", "apellido2", "createdAt", "deletedAt", "email", "id", "nombre", "password", "role", "rut", "updatedAt") SELECT "apellido1", "apellido2", coalesce("createdAt", CURRENT_TIMESTAMP) AS "createdAt", "deletedAt", "email", "id", "nombre", "password", "role", "rut", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_rut_key" ON "User"("rut");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
