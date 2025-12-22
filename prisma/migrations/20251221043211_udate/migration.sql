-- CreateTable
CREATE TABLE "MenuCategoriaPlantilla" (
    "id" SERIAL NOT NULL,
    "subCategoria" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "MenuCategoriaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategoriaPlantilla_subCategoria_key" ON "MenuCategoriaPlantilla"("subCategoria");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategoriaPlantilla_nombre_key" ON "MenuCategoriaPlantilla"("nombre");

-- AddForeignKey
ALTER TABLE "MenuCategoriaPlantilla" ADD CONSTRAINT "MenuCategoriaPlantilla_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaPlantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;
