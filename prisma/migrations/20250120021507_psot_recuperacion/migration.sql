/*
  Warnings:

  - Made the column `content` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tema" TEXT NOT NULL DEFAULT 'general',
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'YOUTUBE',
    "url" TEXT,
    "rutaLocal" TEXT,
    "descripcion" TEXT,
    "duracion" TEXT,
    "categorias" TEXT,
    "fechaSubida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "miniatura" TEXT,
    "formato" TEXT
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tema" TEXT NOT NULL DEFAULT 'general',
    "titulo" TEXT NOT NULL,
    "tipo" TEXT DEFAULT 'PDF',
    "url" TEXT,
    "rutaLocal" TEXT,
    "descripcion" TEXT,
    "categorias" TEXT,
    "fechaSubida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formato" TEXT,
    "contenidoHTML" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Note" ("content", "createdAt", "id", "title", "updatedAt") SELECT "content", "createdAt", "id", "title", "updatedAt" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
