/*
  Warnings:

  - Made the column `division` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `district` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `upazila` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "division" SET NOT NULL,
ALTER COLUMN "district" SET NOT NULL,
ALTER COLUMN "upazila" SET NOT NULL;
