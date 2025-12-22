-- CreateTable
CREATE TABLE "CategoriaPlantilla" (
    "id" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CategoriaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaPlantilla_categoria_key" ON "CategoriaPlantilla"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaPlantilla_nombre_key" ON "CategoriaPlantilla"("nombre");
