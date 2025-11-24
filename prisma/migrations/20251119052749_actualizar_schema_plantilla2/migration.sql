-- DropForeignKey
ALTER TABLE "public"."plantilla" DROP CONSTRAINT "plantilla_temaId_fkey";

-- CreateTable
CREATE TABLE "CategoriaPlantilla" (
    "id" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CategoriaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategoriaPlantilla" (
    "id" SERIAL NOT NULL,
    "subCategoria" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "MenuCategoriaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaPlantilla_categoria_key" ON "CategoriaPlantilla"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaPlantilla_nombre_key" ON "CategoriaPlantilla"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategoriaPlantilla_subCategoria_key" ON "MenuCategoriaPlantilla"("subCategoria");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategoriaPlantilla_nombre_key" ON "MenuCategoriaPlantilla"("nombre");

-- AddForeignKey
ALTER TABLE "MenuCategoriaPlantilla" ADD CONSTRAINT "MenuCategoriaPlantilla_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaPlantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantilla" ADD CONSTRAINT "plantilla_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "MenuCategoriaPlantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;
