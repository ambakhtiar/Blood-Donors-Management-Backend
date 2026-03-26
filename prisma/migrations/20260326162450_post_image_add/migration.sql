-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "isApproved" SET DEFAULT true;
