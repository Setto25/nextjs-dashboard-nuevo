/*
  Warnings:

  - You are about to drop the column `rutaLocal` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "rutaLocal",
DROP COLUMN "url",
ADD COLUMN     "idDailymotion" TEXT,
ADD COLUMN     "idYoutube" TEXT,
ADD COLUMN     "plataforma" TEXT,
ALTER COLUMN "tipo" SET DEFAULT 'URL';
