-- AlterTable
ALTER TABLE "Libro" ADD COLUMN     "formato" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'Blackblaze_B2';
