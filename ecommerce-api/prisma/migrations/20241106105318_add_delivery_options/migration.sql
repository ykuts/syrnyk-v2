/*
  Warnings:

  - You are about to drop the column `addressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('PICKUP', 'ADDRESS', 'RAILWAY_STATION');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "addressId",
DROP COLUMN "notes",
ADD COLUMN     "deliveryType" "DeliveryType" NOT NULL DEFAULT 'RAILWAY_STATION',
ADD COLUMN     "notesAdmin" TEXT,
ADD COLUMN     "notesClient" TEXT;

-- DropTable
DROP TABLE "Address";

-- CreateTable
CREATE TABLE "AddressDelivery" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "apartment" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddressDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationDelivery" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "meetingTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupDelivery" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RailwayStation" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meetingPoint" TEXT NOT NULL,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RailwayStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "workingHours" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AddressDelivery_orderId_key" ON "AddressDelivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "StationDelivery_orderId_key" ON "StationDelivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PickupDelivery_orderId_key" ON "PickupDelivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "RailwayStation_city_name_key" ON "RailwayStation"("city", "name");

-- AddForeignKey
ALTER TABLE "AddressDelivery" ADD CONSTRAINT "AddressDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationDelivery" ADD CONSTRAINT "StationDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationDelivery" ADD CONSTRAINT "StationDelivery_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RailwayStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupDelivery" ADD CONSTRAINT "PickupDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupDelivery" ADD CONSTRAINT "PickupDelivery_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
