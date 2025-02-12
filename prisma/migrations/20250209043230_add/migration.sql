/*
  Warnings:

  - A unique constraint covering the columns `[rut]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "rut" TEXT;
ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "User_rut_key" ON "User"("rut");
