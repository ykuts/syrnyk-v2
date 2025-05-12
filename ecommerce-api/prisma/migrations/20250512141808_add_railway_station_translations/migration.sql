-- CreateTable
CREATE TABLE "RailwayStationTranslation" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT,
    "meetingPoint" TEXT,

    CONSTRAINT "RailwayStationTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RailwayStationTranslation_stationId_language_key" ON "RailwayStationTranslation"("stationId", "language");

-- AddForeignKey
ALTER TABLE "RailwayStationTranslation" ADD CONSTRAINT "RailwayStationTranslation_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RailwayStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
