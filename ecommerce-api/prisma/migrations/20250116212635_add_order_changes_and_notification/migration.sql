-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "changes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastNotificationSent" TIMESTAMP(3);
