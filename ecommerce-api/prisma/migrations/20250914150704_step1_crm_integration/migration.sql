-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEB', 'TELEGRAM_BOT', 'ADMIN_PANEL', 'API');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'NOT_REQUIRED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REQUIRES_AGREEMENT';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "externalOrderId" TEXT,
ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "orderSource" TEXT NOT NULL DEFAULT 'WEB',
ADD COLUMN     "sendpulseContactId" TEXT,
ADD COLUMN     "sendpulseDealId" TEXT,
ADD COLUMN     "syncStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "consumptionIndex" DECIMAL(10,3) NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "OrderSyncLog" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "sendpulseDealId" TEXT,
    "syncType" TEXT NOT NULL,
    "syncDirection" TEXT NOT NULL,
    "syncStatus" TEXT NOT NULL,
    "syncData" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderSyncLog_orderId_idx" ON "OrderSyncLog"("orderId");

-- CreateIndex
CREATE INDEX "OrderSyncLog_syncStatus_idx" ON "OrderSyncLog"("syncStatus");

-- CreateIndex
CREATE INDEX "OrderSyncLog_syncType_idx" ON "OrderSyncLog"("syncType");

-- CreateIndex
CREATE INDEX "OrderSyncLog_createdAt_idx" ON "OrderSyncLog"("createdAt");

-- CreateIndex
CREATE INDEX "Order_sendpulseDealId_idx" ON "Order"("sendpulseDealId");

-- CreateIndex
CREATE INDEX "Order_externalOrderId_idx" ON "Order"("externalOrderId");

-- CreateIndex
CREATE INDEX "Order_syncStatus_idx" ON "Order"("syncStatus");

-- CreateIndex
CREATE INDEX "Order_orderSource_idx" ON "Order"("orderSource");

-- CreateIndex
CREATE INDEX "Product_consumptionIndex_idx" ON "Product"("consumptionIndex");

-- AddForeignKey
ALTER TABLE "OrderSyncLog" ADD CONSTRAINT "OrderSyncLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
