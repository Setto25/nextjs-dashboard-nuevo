/*
  Warnings:

  - You are about to drop the column `rutaLocal` on the `ManualEquipo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ManualEquipo" DROP COLUMN "rutaLocal",
ADD COLUMN     "portada" TEXT,
ADD COLUMN     "url" TEXT;
