/*
  Warnings:

  - You are about to drop the column `categorias` on the `plantilla` table. All the data in the column will be lost.
  - You are about to drop the `CategoriaPlantilla` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuCategoriaPlantilla` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Categoria` to the `plantilla` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MenuCategoriaPlantilla" DROP CONSTRAINT "MenuCategoriaPlantilla_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plantilla" DROP CONSTRAINT "plantilla_temaId_fkey";

-- AlterTable
ALTER TABLE "plantilla" DROP COLUMN "categorias",
ADD COLUMN     "Categoria" TEXT NOT NULL,
ADD COLUMN     "palabrasClave" TEXT;

-- DropTable
DROP TABLE "public"."CategoriaPlantilla";

-- DropTable
DROP TABLE "public"."MenuCategoriaPlantilla";
