-- CreateEnum
CREATE TYPE "SmsType" AS ENUM ('CLOCK_IN_BEFORE', 'CLOCK_IN_AFTER', 'CLOCK_OUT_BEFORE', 'CLOCK_OUT_AFTER');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Caregiver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Caregiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "clockInDone" BOOLEAN NOT NULL DEFAULT false,
    "clockOutDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsJob" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "type" "SmsType" NOT NULL,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "Caregiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsJob" ADD CONSTRAINT "SmsJob_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
