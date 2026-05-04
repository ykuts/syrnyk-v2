/*
  Warnings:

  - Added the required column `canton` to the `AddressDelivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddressDelivery" ADD COLUMN "canton" TEXT NOT NULL DEFAULT 'VD';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveryOrder" INTEGER;

-- CreateIndex
CREATE INDEX "Order_deliveryDate_deliveryOrder_idx" ON "Order"("deliveryDate", "deliveryOrder");
