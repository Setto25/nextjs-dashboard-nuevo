/*
  Warnings:

  - You are about to drop the column `Categoria` on the `plantilla` table. All the data in the column will be lost.
  - You are about to drop the column `temaId` on the `plantilla` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `plantilla` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plantilla" DROP COLUMN "Categoria",
DROP COLUMN "temaId",
ADD COLUMN     "categoria" TEXT NOT NULL,
ALTER COLUMN "tema" DROP NOT NULL;
