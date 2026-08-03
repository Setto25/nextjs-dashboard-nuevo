/*
  Warnings:

  - You are about to drop the column `rutaLocal` on the `Protocolo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Protocolo" DROP COLUMN "rutaLocal",
ADD COLUMN     "formato" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'Blackblaze_B2',
ADD COLUMN     "url" TEXT;
