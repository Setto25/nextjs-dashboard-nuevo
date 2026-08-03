/*
  Warnings:

  - You are about to drop the column `rutaLocal` on the `Documento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documento" DROP COLUMN "rutaLocal",
ADD COLUMN     "portada" TEXT;
