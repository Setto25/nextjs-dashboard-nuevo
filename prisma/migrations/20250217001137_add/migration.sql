-- CreateTable
CREATE TABLE "ManualEquipo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "categorias" TEXT,
    "fechaSubida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Libro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tema" TEXT,
    "version" INTEGER,
    "anno" INTEGER,
    "categorias" TEXT,
    "fechaSubida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Protocolo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "fechaCreacion" DATETIME NOT NULL,
    "fechaRevision" DATETIME NOT NULL,
    "vigencia" DATETIME NOT NULL,
    "creadoPor" TEXT NOT NULL,
    "rutaLocal" TEXT,
    "fechaSubida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Protocolo" ("categoria", "codigo", "creadoPor", "descripcion", "fechaCreacion", "fechaRevision", "fechaSubida", "id", "rutaLocal", "titulo", "version", "vigencia") SELECT "categoria", "codigo", "creadoPor", "descripcion", "fechaCreacion", "fechaRevision", "fechaSubida", "id", "rutaLocal", "titulo", "version", "vigencia" FROM "Protocolo";
DROP TABLE "Protocolo";
ALTER TABLE "new_Protocolo" RENAME TO "Protocolo";
CREATE UNIQUE INDEX "Protocolo_codigo_key" ON "Protocolo"("codigo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
