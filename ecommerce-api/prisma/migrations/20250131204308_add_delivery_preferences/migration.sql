/*
  Warnings:

  - You are about to drop the column `preferredDeliveryLocation` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "preferredDeliveryLocation",
ADD COLUMN     "deliveryAddress" JSONB,
ADD COLUMN     "preferredDeliveryType" TEXT,
ADD COLUMN     "preferredStation" JSONB,
ADD COLUMN     "preferredStore" JSONB;
