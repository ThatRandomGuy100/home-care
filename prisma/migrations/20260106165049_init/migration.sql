/*
  Warnings:

  - A unique constraint covering the columns `[externalCode]` on the table `Caregiver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[admissionId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalVisitId]` on the table `Visit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalCode` to the `Caregiver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionId` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalVisitId` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Caregiver" ADD COLUMN     "externalCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "admissionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "externalVisitId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Caregiver_externalCode_key" ON "Caregiver"("externalCode");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_admissionId_key" ON "Patient"("admissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_externalVisitId_key" ON "Visit"("externalVisitId");
