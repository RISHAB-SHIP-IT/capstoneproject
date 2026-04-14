-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "stateCode" INTEGER NOT NULL,
    "stateName" TEXT NOT NULL,
    "districtCode" INTEGER NOT NULL,
    "districtName" TEXT NOT NULL,
    "subDistrict" TEXT NOT NULL,
    "villageCode" INTEGER NOT NULL,
    "villageName" TEXT NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Village_villageCode_key" ON "Village"("villageCode");
