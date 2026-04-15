/*
  Warnings:

  - You are about to drop the column `weightDuringDonation` on the `DonationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `HospitalDonationRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId]` on the table `HospitalDonationRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DonationHistory" DROP COLUMN "weightDuringDonation";

-- AlterTable
ALTER TABLE "HospitalDonationRecord" DROP COLUMN "weight",
ADD COLUMN     "postId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HospitalDonationRecord_postId_key" ON "HospitalDonationRecord"("postId");

-- AddForeignKey
ALTER TABLE "HospitalDonationRecord" ADD CONSTRAINT "HospitalDonationRecord_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
