-- AlterTable
ALTER TABLE "BloodDonor" ALTER COLUMN "division" DROP NOT NULL,
ALTER COLUMN "district" DROP NOT NULL,
ALTER COLUMN "upazila" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DonorProfile" ADD COLUMN     "dob" TIMESTAMP(3);
