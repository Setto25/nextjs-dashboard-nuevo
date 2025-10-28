/*
  Warnings:

  - You are about to drop the column `rutaLocal` on the `Libro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Libro" DROP COLUMN "rutaLocal",
ADD COLUMN     "googleFileId" TEXT,
ADD COLUMN     "url" TEXT;
