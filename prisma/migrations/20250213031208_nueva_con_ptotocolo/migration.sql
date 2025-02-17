-- CreateTable
CREATE TABLE "Protocolo" (
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
    "rutaLocal" TEXT NOT NULL,
    "fechaSubida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Protocolo_codigo_key" ON "Protocolo"("codigo");
