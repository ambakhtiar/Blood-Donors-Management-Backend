/*
  Warnings:

  - You are about to drop the column `requiredDate` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BloodDonor" ADD COLUMN     "area" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "requiredDate",
ADD COLUMN     "area" TEXT,
ADD COLUMN     "bkashNagadNumber" TEXT,
ADD COLUMN     "bloodBags" INTEGER,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "donationTime" TIMESTAMP(3),
ADD COLUMN     "hemoglobin" DOUBLE PRECISION,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "medicalIssues" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "needsPasswordChange" BOOLEAN NOT NULL DEFAULT false;
