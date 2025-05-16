-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" JSONB,
ADD COLUMN     "deliveryCost" DECIMAL(10,2),
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "deliveryPickupLocationId" INTEGER,
ADD COLUMN     "deliveryStationId" INTEGER,
ADD COLUMN     "deliveryTimeSlot" TEXT;

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryCity" (
    "id" SERIAL NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "freeThreshold" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupLocation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "openingHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryTimeSlot" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "zoneId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryCity_postalCode_idx" ON "DeliveryCity"("postalCode");

-- CreateIndex
CREATE INDEX "DeliveryCity_zoneId_idx" ON "DeliveryCity"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryCity_postalCode_name_key" ON "DeliveryCity"("postalCode", "name");

-- AddForeignKey
ALTER TABLE "DeliveryCity" ADD CONSTRAINT "DeliveryCity_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTimeSlot" ADD CONSTRAINT "DeliveryTimeSlot_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
