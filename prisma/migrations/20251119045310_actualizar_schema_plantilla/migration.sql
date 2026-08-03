-- CreateTable
CREATE TABLE "plantilla" (
    "id" SERIAL NOT NULL,
    "tema" TEXT NOT NULL,
    "temaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT DEFAULT 'PDF',
    "url" TEXT,
    "portada" TEXT,
    "descripcion" TEXT,
    "categorias" TEXT,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formato" TEXT,

    CONSTRAINT "plantilla_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plantilla" ADD CONSTRAINT "plantilla_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "MenuCategoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
